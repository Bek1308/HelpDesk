import { Component, Injector, OnInit, ChangeDetectorRef, NgZone, AfterViewInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CreateServiceDialogComponent } from './create-service-dialog/create-service-dialog.component';
import { EditServiceDialogComponent } from './edit-service-dialog/edit-service-dialog.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { AppComponentBase } from '@shared/app-component-base';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { ServiceDto, ServiceDtoPagedResultDto } from '@shared/api-services/services/model/service-dto.model';
import { ServicesServiceProxy } from '@shared/api-services/services/services.service';

@Component({
    selector: 'app-services',
    templateUrl: './services.component.html',
    animations: [appModuleAnimation()],
    standalone: true,
    imports: [FormsModule, CommonModule, LocalizePipe],
})
export class ServicesComponent extends AppComponentBase implements OnInit, AfterViewInit {
    isDropdownOpen: boolean = false;
    isRecordsPerPageDropdownOpen: boolean = false;
    isActiveDropdownOpen: boolean = false;
    keyword = '';
    isActive: boolean | null = null;
    advancedFiltersVisible = false;
    sortField: string = 'name';
    sortOrder: number = 1;
    records: ServiceDto[] = [];
    isLoading = false;
    predefinedRecordsCountPerPage = [5, 10, 25, 50, 100, 250, 500];
    recordsPerPage = 10;
    totalRecordsCount = 0;
    currentPage = 0;
    totalPages = 0;
    private searchSubject = new Subject<string>();

    constructor(
        private injector: Injector,
        private _servicesService: ServicesServiceProxy,
        private _modalService: BsModalService,
        private _activatedRoute: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private zone: NgZone,
        private featherIconService: FeatherIconService
    ) {
        super(injector);
        this.keyword = this._activatedRoute.snapshot.queryParams['keyword'] || '';
        this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
            console.log('Search triggered with keyword:', this.keyword);
            this.currentPage = 0;
            this.list();
        });
    }

    ngOnInit(): void {
        console.log('Initializing ServicesComponent');
        this.list();
    }

    ngAfterViewInit(): void {
        console.log('Replacing initial icons');
        this.featherIconService.replaceIcons();
    }

    showLoadingIndicator(): void {
        this.isLoading = true;
        this.cd.markForCheck();
    }

    hideLoadingIndicator(): void {
        this.isLoading = false;
        this.cd.markForCheck();
    }

    getSorting(): string {
        return `${this.sortField} ${this.sortOrder === 1 ? 'ASC' : 'DESC'}`;
    }

    getSkipCount(): number {
        return this.currentPage * this.recordsPerPage;
    }

    getMaxResultCount(): number {
        return this.recordsPerPage;
    }

    sort(field: string): void {
        if (this.sortField === field) {
            this.sortOrder = -this.sortOrder;
        } else {
            this.sortField = field;
            this.sortOrder = 1;
        }
        this.list();
    }

    clearFilters(): void {
        console.log('Clearing filters');
        this.keyword = '';
        this.isActive = null;
        this.currentPage = 0;
        this.list();
    }

    debouncedList(): void {
        this.searchSubject.next(this.keyword);
    }

    list(): void {
        this.showLoadingIndicator();
        this._servicesService
            .getAll(
                this.keyword,
                this.getSorting(),
                this.getSkipCount(),
                this.getMaxResultCount()
            )
            .pipe(
                finalize(() => {
                    this.hideLoadingIndicator();
                })
            )
            .subscribe({
                next: (result: ServiceDtoPagedResultDto) => {
                    console.log('Data fetched:', result);
                    this.records = result.items;
                    this.totalRecordsCount = result.totalCount;
                    this.totalPages = Math.ceil(this.totalRecordsCount / this.recordsPerPage) || 1;
                    this.cd.markForCheck();
                },
                error: (error) => {
                    console.error('Error fetching services:', error);
                    this.notify.error(this.l('FailedToLoadServices'));
                    this.hideLoadingIndicator();
                }
            });
    }

    delete(service: ServiceDto): void {
        this.message.confirm(this.l('ServiceDeleteWarningMessage', service.name), undefined, (result: boolean) => {
            if (result) {
                console.log('Deleting service:', service.id);
                this._servicesService
                    .delete(service.id)
                    .pipe(
                        finalize(() => {
                            this.notify.success(this.l('SuccessfullyDeleted'));
                            this.refresh();
                        })
                    )
                    .subscribe({
                        error: (error) => {
                            console.error('Error deleting service:', error);
                            this.notify.error(this.l('FailedToDeleteService'));
                        }
                    });
            }
        });
    }

    createService(): void {
        this.showCreateOrEditServiceDialog();
    }

    editService(service: ServiceDto): void {
        this.showCreateOrEditServiceDialog(service.id);
    }

    showCreateOrEditServiceDialog(id?: number): void {
        let createOrEditServiceDialog: BsModalRef;
        if (!id) {
            createOrEditServiceDialog = this._modalService.show(CreateServiceDialogComponent, {
                class: 'modal-lg',
            });
        } else {
            createOrEditServiceDialog = this._modalService.show(EditServiceDialogComponent, {
                class: 'modal-lg',
                initialState: {
                    id: id,
                },
            });
        }

        createOrEditServiceDialog.content.onSave.subscribe(() => {
            this.refresh();
        });
    }

    refresh(): void {
        console.log('Refreshing services list');
        this.currentPage = 0;
        this.list();
    }

    goToFirstPage(): void {
        this.currentPage = 0;
        this.list();
    }

    goToPreviousPage(): void {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.list();
        }
    }

    goToNextPage(): void {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.list();
        }
    }

    goToLastPage(): void {
        this.currentPage = this.totalPages - 1;
        this.list();
    }

    onRecordsPerPageChange(): void {
        this.currentPage = 0;
        this.list();
    }

    selectIsActive(value: boolean | null): void {
        this.isActive = value;
        this.isActiveDropdownOpen = false;
        this.debouncedList();
    }

    trackById(index: number, service: ServiceDto): number {
        return service.id;
    }
}