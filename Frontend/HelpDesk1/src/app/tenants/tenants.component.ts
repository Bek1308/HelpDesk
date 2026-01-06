import { Component, Injector, OnInit, ChangeDetectorRef, NgZone, AfterViewInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { TenantServiceProxy, TenantDto, TenantDtoPagedResultDto } from '@shared/service-proxies/service-proxies';
import { CreateTenantDialogComponent } from './create-tenant/create-tenant-dialog.component';
import { EditTenantDialogComponent } from './edit-tenant/edit-tenant-dialog.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { AppComponentBase } from '@shared/app-component-base';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';

@Component({
    selector: 'app-tenants',
    templateUrl: './tenants.component.html',
    animations: [appModuleAnimation()],
    standalone: true,
    imports: [FormsModule, CommonModule, LocalizePipe],
})
export class TenantsComponent extends AppComponentBase implements OnInit, AfterViewInit {
    isDropdownOpen: boolean = false; // Pagination dropdown holati
    isRecordsPerPageDropdownOpen: boolean = false;
    isActiveDropdownOpen: boolean = false; // IsActive dropdown holati
    keyword = '';
    isActive: boolean | null = null;
    advancedFiltersVisible = false;
    sortField: string = 'tenancyName';
    sortOrder: number = 1; // 1 for ascending, -1 for descending
    records: TenantDto[] = [];
    isLoading = false;
    predefinedRecordsCountPerPage = [5, 10, 25, 50, 100, 250, 500];
    recordsPerPage = 10;
    totalRecordsCount = 0;
    currentPage = 0;
    totalPages = 0;
    private searchSubject = new Subject<string>();

    constructor(
        private injector: Injector,
        private _tenantService: TenantServiceProxy,
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
            this.currentPage = 0; // Reset to first page on search
            this.list();
        });
    }

    ngOnInit(): void {
        console.log('Initializing TenantsComponent');
        this.list();
    }

    ngAfterViewInit(): void {
        console.log('Replacing initial icons');
        this.featherIconService.replaceIcons();
        this.cd.detectChanges();
    }

    showLoadingIndicator(): void {
        this.isLoading = true;
        this.cd.detectChanges();
    }

    hideLoadingIndicator(): void {
        this.isLoading = false;
        this.cd.detectChanges();
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
        console.log('Sorting by:', field, 'Order:', this.sortOrder);
        if (this.sortField === field) {
            this.sortOrder = -this.sortOrder;
        } else {
            this.sortField = field;
            this.sortOrder = 1;
        }
        this.list();
    }

    debouncedList(): void {
        console.log('Debounced list called with keyword:', this.keyword);
        this.searchSubject.next(this.keyword);
    }

    clearFilters(): void {
        console.log('Clearing filters');
        this.keyword = '';
        this.isActive = null;
        this.currentPage = 0;
        this.list();
    }

    list(): void {
        console.log('Fetching tenants with params:', {
            keyword: this.keyword || '',
            isActive: this.isActive === null ? undefined : this.isActive,
            sorting: this.getSorting(),
            skipCount: this.getSkipCount(),
            maxResultCount: this.getMaxResultCount()
        });
        this.showLoadingIndicator();

        this.zone.run(() => {
            this._tenantService
                .getAll(
                    this.keyword || '',
                    this.isActive === null ? undefined : this.isActive, // Map null to undefined
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
                    next: (result: TenantDtoPagedResultDto) => {
                        console.log('Tenants fetched:', result);
                        this.records = result.items || [];
                        this.totalRecordsCount = result.totalCount || 0;
                        this.totalPages = Math.ceil(this.totalRecordsCount / this.recordsPerPage) || 1;
                        this.cd.detectChanges();
                        setTimeout(() => {
                            console.log('Replacing icons after data load');
                            this.featherIconService.replaceIcons();
                            this.cd.detectChanges();
                        }, 0);
                    },
                    error: (error) => {
                        console.error('Error fetching tenants:', error);
                        this.notify.error(this.l('FailedToLoadTenants'));
                        this.records = [];
                        this.totalRecordsCount = 0;
                        this.totalPages = 1;
                        this.hideLoadingIndicator();
                        this.cd.detectChanges();
                    }
                });
        });
    }

    delete(tenant: TenantDto): void {
        this.message.confirm(this.l('TenantDeleteWarningMessage', tenant.name), undefined, (result: boolean) => {
            if (result) {
                console.log('Deleting tenant:', tenant.id);
                this._tenantService
                    .delete(tenant.id)
                    .pipe(
                        finalize(() => {
                            this.notify.success(this.l('SuccessfullyDeleted'));
                            this.refresh();
                        })
                    )
                    .subscribe({
                        error: (error) => {
                            console.error('Error deleting tenant:', error);
                            this.notify.error(this.l('FailedToDeleteTenant'));
                        }
                    });
            }
        });
    }

    createTenant(): void {
        this.showCreateOrEditTenantDialog();
    }

    editTenant(tenant: TenantDto): void {
        this.showCreateOrEditTenantDialog(tenant.id);
    }

    showCreateOrEditTenantDialog(id?: number): void {
        let createOrEditTenantDialog: BsModalRef;
        if (!id) {
            createOrEditTenantDialog = this._modalService.show(CreateTenantDialogComponent, {
                class: 'modal-lg',
            });
        } else {
            createOrEditTenantDialog = this._modalService.show(EditTenantDialogComponent, {
                class: 'modal-lg',
                initialState: {
                    id: id,
                },
            });
        }

        createOrEditTenantDialog.content.onSave.subscribe(() => {
            this.refresh();
        });
    }

    refresh(): void {
        console.log('Refreshing tenants list');
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

    trackById(index: number, tenant: TenantDto): number {
        return tenant.id;
    }

    selectIsActive(value: boolean | null) {
        this.isActive = value;
        this.isActiveDropdownOpen = false;
        this.debouncedList();
    }
}