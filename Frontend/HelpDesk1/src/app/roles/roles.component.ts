import { Component, Injector, OnInit, ChangeDetectorRef, NgZone, AfterViewInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { RoleServiceProxy, RoleDto, RoleDtoPagedResultDto } from '@shared/service-proxies/service-proxies';
import { CreateRoleDialogComponent } from './create-role/create-role-dialog.component';
import { EditRoleDialogComponent } from './edit-role/edit-role-dialog.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { AppComponentBase } from '@shared/app-component-base';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    animations: [appModuleAnimation()],
    standalone: true,
    imports: [FormsModule, CommonModule, LocalizePipe],
})
export class RolesComponent extends AppComponentBase implements OnInit, AfterViewInit {
    isDropdownOpen: boolean = false;
    advancedFiltersVisible = false;
    isRecordsPerPageDropdownOpen: boolean = false;
    keyword = '';
    sortField: string = 'name';
    sortOrder: number = 1; // 1 for ascending, -1 for descending
    records: RoleDto[] = [];
    isLoading = false;
    predefinedRecordsCountPerPage = [5, 10, 25, 50, 100, 250, 500];
    recordsPerPage = 10;
    totalRecordsCount = 0;
    currentPage = 0;
    totalPages = 0;
    private searchSubject = new Subject<string>();

    constructor(
        private injector: Injector,
        private _rolesService: RoleServiceProxy,
        private _modalService: BsModalService,
        private _activatedRoute: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private zone: NgZone,
        private featherIconService: FeatherIconService
    ) {
        super(injector);
        this.keyword = this._activatedRoute.snapshot.queryParams['keyword'] || '';
        this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
            this.currentPage = 0; // Reset to first page on search
            this.list();
        });
    }

    ngOnInit(): void {
        this.list(); // Load data on component initialization
    }

    ngAfterViewInit(): void {
        this.featherIconService.replaceIcons(); // Initial icon replacement after view is initialized
        this.cd.detectChanges(); // Ensure UI updates
    }

    showLoadingIndicator(): void {
        this.isLoading = true;
        this.cd.detectChanges();
    }

    hideLoadingIndicator(): void {
        this.isLoading = false;
        this.cd.detectChanges(); // Ensure UI updates when loading stops
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

    debouncedList(): void {
        this.searchSubject.next(this.keyword);
    }

    list(): void {
        this.showLoadingIndicator();

        this.zone.run(() => { // Ensure subscription runs in Angular's zone
            this._rolesService
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
                    next: (result: RoleDtoPagedResultDto) => {
                        console.log('Data fetched:', result); // Debug log
                        this.records = result.items;
                        this.totalRecordsCount = result.totalCount;
                        this.totalPages = Math.ceil(this.totalRecordsCount / this.recordsPerPage) || 1;
                        this.cd.detectChanges(); // Ensure UI updates after data is set
                        setTimeout(() => {
                            this.featherIconService.replaceIcons(); // Replace icons after dynamic content is rendered
                            this.cd.detectChanges(); // Ensure UI updates after icon replacement
                        }, 0); // Defer to next tick to ensure DOM is updated
                    },
                    error: (error) => {
                        console.error('Error fetching roles:', error);
                        this.notify.error(this.l('FailedToLoadRoles'));
                        this.hideLoadingIndicator(); // Ensure loading stops on error
                    }
                });
        });
    }

    delete(role: RoleDto): void {
        this.message.confirm(this.l('RoleDeleteWarningMessage', role.displayName), undefined, (result: boolean) => {
            if (result) {
                this._rolesService
                    .delete(role.id)
                    .pipe(
                        finalize(() => {
                            this.notify.success(this.l('SuccessfullyDeleted'));
                            this.refresh();
                        })
                    )
                    .subscribe({
                        error: (error) => {
                            console.error('Error deleting role:', error);
                            this.notify.error(this.l('FailedToDeleteRole'));
                        }
                    });
            }
        });
    }

    createRole(): void {
        this.showCreateOrEditRoleDialog();
    }

    editRole(role: RoleDto): void {
        this.showCreateOrEditRoleDialog(role.id);
    }

    showCreateOrEditRoleDialog(id?: number): void {
        let createOrEditRoleDialog: BsModalRef;
        if (!id) {
            createOrEditRoleDialog = this._modalService.show(CreateRoleDialogComponent, {
                class: 'modal-lg',
            });
        } else {
            createOrEditRoleDialog = this._modalService.show(EditRoleDialogComponent, {
                class: 'modal-lg',
                initialState: {
                    id: id,
                },
            });
        }

        createOrEditRoleDialog.content.onSave.subscribe(() => {
            this.refresh();
        });
    }

    refresh(): void {
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

    trackById(index: number, role: RoleDto): number {
        return role.id;
    }
}
