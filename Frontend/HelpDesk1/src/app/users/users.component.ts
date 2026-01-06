import { Component, Injector, OnInit, ChangeDetectorRef, NgZone, AfterViewInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { UserServiceProxy, UserDto, UserDtoPagedResultDto } from '@shared/service-proxies/service-proxies';
import { CreateUserDialogComponent } from './create-user/create-user-dialog.component';
import { EditUserDialogComponent } from './edit-user/edit-user-dialog.component';
import { ResetPasswordDialogComponent } from './reset-password/reset-password.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { AppComponentBase } from '@shared/app-component-base';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    animations: [appModuleAnimation()],
    standalone: true,
    imports: [FormsModule, CommonModule, LocalizePipe],
})
export class UsersComponent extends AppComponentBase implements OnInit, AfterViewInit {
    isRecordsPerPageDropdownOpen: boolean = false;
    keyword = '';
    isActive: boolean | null = null;
    advancedFiltersVisible = false;
    sortField: string = 'userName';
    sortOrder: number = 1; // 1 for ascending, -1 for descending
    records: UserDto[] = [];
    isLoading = false;
    predefinedRecordsCountPerPage = [5, 10, 25, 50, 100, 250, 500];
    recordsPerPage = 10;
    totalRecordsCount = 0;
    currentPage = 0;
    totalPages = 0;
    private searchSubject = new Subject<string>();

    constructor(
        private injector: Injector,
        private _userService: UserServiceProxy,
        private _modalService: BsModalService,
        private _activatedRoute: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private zone: NgZone,
        private featherIconService: FeatherIconService
    ) {
        super(injector);
        this.keyword = this._activatedRoute.snapshot.queryParams['filterText'] || '';
        this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
            console.log('Search triggered with keyword:', this.keyword);
            this.currentPage = 0; // Reset to first page on search
            this.list();
        });
    }

    ngOnInit(): void {
        console.log('Initializing UsersComponent');
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
        // Map 'fullName' to 'name' for backend compatibility
        const field = this.sortField === 'fullName' ? 'name' : this.sortField;
        return `${field} ${this.sortOrder === 1 ? 'ASC' : 'DESC'}`;
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
        console.log('Fetching users with params:', {
            keyword: this.keyword || '',
            isActive: this.isActive === null ? undefined : this.isActive,
            sorting: this.getSorting(),
            skipCount: this.getSkipCount(),
            maxResultCount: this.getMaxResultCount()
        });
        this.showLoadingIndicator();

        this.zone.run(() => {
            this._userService
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
                    next: (result: UserDtoPagedResultDto) => {
                        console.log('Users fetched:', result);
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
                        console.error('Error fetching users:', error);
                        this.notify.error(this.l('FailedToLoadUsers'));
                        this.records = [];
                        this.totalRecordsCount = 0;
                        this.totalPages = 1;
                        this.hideLoadingIndicator();
                        this.cd.detectChanges();
                    }
                });
        });
    }

    delete(user: UserDto): void {
        this.message.confirm(this.l('UserDeleteWarningMessage', user.fullName), undefined, (result: boolean) => {
            if (result) {
                console.log('Deleting user:', user.id);
                this._userService
                    .delete(user.id)
                    .pipe(
                        finalize(() => {
                            this.notify.success(this.l('SuccessfullyDeleted'));
                            this.refresh();
                        })
                    )
                    .subscribe({
                        error: (error) => {
                            console.error('Error deleting user:', error);
                            this.notify.error(this.l('FailedToDeleteUser'));
                        }
                    });
            }
        });
    }

    createUser(): void {
        this.showCreateOrEditUserDialog();
    }

    editUser(user: UserDto): void {
        this.showCreateOrEditUserDialog(user.id);
    }

    resetPassword(user: UserDto): void {
        this.showResetPasswordUserDialog(user.id);
    }

    private showResetPasswordUserDialog(id?: number): void {
        this._modalService.show(ResetPasswordDialogComponent, {
            class: 'modal-lg',
            initialState: {
                id: id,
            },
        });
    }

    private showCreateOrEditUserDialog(id?: number): void {
        let createOrEditUserDialog: BsModalRef;
        if (!id) {
            createOrEditUserDialog = this._modalService.show(CreateUserDialogComponent, {
                class: 'modal-lg',
            });
        } else {
            createOrEditUserDialog = this._modalService.show(EditUserDialogComponent, {
                class: 'modal-lg',
                initialState: {
                    id: id,
                },
            });
        }

        createOrEditUserDialog.content.onSave.subscribe(() => {
            this.refresh();
        });
    }

    refresh(): void {
        console.log('Refreshing users list');
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

    trackById(index: number, user: UserDto): number {
        return user.id;
    }
}