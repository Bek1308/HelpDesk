
import { IssuesTypeDto, IssuesTypeDtoPagedResultDto } from '@shared/api-services/issues-types/model/issues-type-dto.model';
import { Component, Injector, OnInit, ChangeDetectorRef, NgZone, AfterViewInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { AppComponentBase } from '@shared/app-component-base';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { CreateIssuesTypeDialogComponent } from './create-issues-type-dialog/create-issues-type-dialog.component';
import { EditIssuesTypeDialogComponent } from './edit-issues-type-dialog/edit-issues-type-dialog.component';
import { IssuesTypeServiceProxy } from '@shared/api-services/issues-types/issues-type.service';

@Component({
  selector: 'app-issues-types',
  standalone: true,
  templateUrl: './issues-types.component.html',
  imports: [FormsModule, CommonModule, LocalizePipe],
  animations: [appModuleAnimation()],
})
export class IssuesTypesComponent extends AppComponentBase implements OnInit, AfterViewInit {

  isDropdownOpen: boolean = false;
    isRecordsPerPageDropdownOpen: boolean = false;
    isActiveDropdownOpen: boolean = false;
    keyword = '';
    isActive: boolean | null = null;
    advancedFiltersVisible = false;
    sortField: string = 'title';
    sortOrder: number = 1;
    records: IssuesTypeDto[] = [];
    isLoading = false;
    predefinedRecordsCountPerPage = [5, 10, 25, 50, 100, 250, 500];
    recordsPerPage = 10;
    totalRecordsCount = 0;
    currentPage = 0;
    totalPages = 0;
    private searchSubject = new Subject<string>();

    constructor(
        private injector: Injector,
        private _issuesTypeService: IssuesTypeServiceProxy,
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
        console.log('Initializing CategoriesComponent');
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
        this._issuesTypeService
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
                next: (result: IssuesTypeDtoPagedResultDto) => {
                    console.log('Data fetched:', result);
                    this.records = result.items;
                    this.totalRecordsCount = result.totalCount;
                    this.totalPages = Math.ceil(this.totalRecordsCount / this.recordsPerPage) || 1;
                    this.cd.markForCheck();
                },
                error: (error) => {
                    console.error('Error fetching categories:', error);
                    this.notify.error(this.l('FailedToLoadCategories'));
                    this.hideLoadingIndicator();
                }
            });
    }

    delete(issuesType: IssuesTypeDto): void {
        this.message.confirm(this.l('IssuesTypeDeleteWarningMessage', issuesType.title), undefined, (result: boolean) => {
            if (result) {
                console.log('Deleting issuesType:', issuesType.id);
                this._issuesTypeService
                    .delete(issuesType.id)
                    .pipe(
                        finalize(() => {
                            this.notify.success(this.l('SuccessfullyDeleted'));
                            this.refresh();
                        })
                    )
                    .subscribe({
                        error: (error) => {
                            console.error('Error deleting IssuesType:', error);
                            this.notify.error(this.l('FailedToDeleteIssuesType'));
                        }
                    });
            }
        });
    }

    createIssuesType(): void {
        this.showCreateOrEditIssuesTypeDialog();
    }

    editIssuesType(issuesType: IssuesTypeDto): void {
        this.showCreateOrEditIssuesTypeDialog(issuesType.id);
    }

    showCreateOrEditIssuesTypeDialog(id?: number): void {
        let createOrEditIssuesTypeDialog: BsModalRef;
        if (!id) {
            createOrEditIssuesTypeDialog = this._modalService.show(CreateIssuesTypeDialogComponent, {
                class: 'modal-lg',
            });
        } else {
            createOrEditIssuesTypeDialog = this._modalService.show(EditIssuesTypeDialogComponent, {
                class: 'modal-lg',
                initialState: {
                    id: id,
                },
            });
        }

        createOrEditIssuesTypeDialog.content.onSave.subscribe(() => {
            this.refresh();
        });
    }

    refresh(): void {
        console.log('Refreshing categories list');
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

    trackById(index: number, issuesType: IssuesTypeDto): number {
        return issuesType.id;
    }
}
