import { Component, Injector, OnInit, ChangeDetectorRef, NgZone, AfterViewInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { PriorityLevelDto, PriorityLevelPagedResultDto } from '@shared/api-services/priority-level/model/priority-level-dto.model';
import { CreatePriorityLevelDialogComponent } from './create-priority-level-dialog/create-priority-level-dialog.component';
import { EditPriorityLevelDialogComponent } from './edit-priority-level-dialog/edit-priority-level-dialog.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { AppComponentBase } from '@shared/app-component-base';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { PriorityLevelServiceProxy } from '@shared/api-services/priority-level/priority-level.service';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-priority-levels',
    templateUrl: './priority-level.component.html',
    animations: [appModuleAnimation()],
    standalone: true,
    imports: [FormsModule, CommonModule, LocalizePipe, NgStyle],
})
export class PriorityLevelComponent extends AppComponentBase implements OnInit, AfterViewInit {
    isDropdownOpen: boolean = false;
    isRecordsPerPageDropdownOpen: boolean = false;
    isActiveDropdownOpen: boolean = false;
    keyword = '';
    isActive: boolean | null = null;
    advancedFiltersVisible = false;
    sortField: string = 'title';
    sortOrder: number = 1;
    records: PriorityLevelDto[] = [];
    isLoading = false;
    predefinedRecordsCountPerPage = [5, 10, 25, 50, 100, 250, 500];
    recordsPerPage = 10;
    totalRecordsCount = 0;
    currentPage = 0;
    totalPages = 0;
    private searchSubject = new Subject<string>();

    constructor(
        private injector: Injector,
        private _priorityLevelService: PriorityLevelServiceProxy,
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
        console.log('Initializing PriorityLevelsComponent');
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
        this._priorityLevelService
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
                next: (result: PriorityLevelPagedResultDto) => {
                    console.log('Data fetched:', result);
                    this.records = result.items;
                    this.totalRecordsCount = result.totalCount;
                    this.totalPages = Math.ceil(this.totalRecordsCount / this.recordsPerPage) || 1;
                    this.cd.markForCheck();
                },
                error: (error) => {
                    console.error('Error fetching priority levels:', error);
                    this.notify.error(this.l('FailedToLoadPriorityLevels'));
                    this.hideLoadingIndicator();
                }
            });
    }

    delete(priorityLevel: PriorityLevelDto): void {
        this.message.confirm(this.l('PriorityLevelDeleteWarningMessage', priorityLevel.title), undefined, (result: boolean) => {
            if (result) {
                console.log('Deleting priority level:', priorityLevel.id);
                this._priorityLevelService
                    .delete(priorityLevel.id)
                    .pipe(
                        finalize(() => {
                            this.notify.success(this.l('SuccessfullyDeleted'));
                            this.refresh();
                        })
                    )
                    .subscribe({
                        error: (error) => {
                            console.error('Error deleting priority level:', error);
                            this.notify.error(this.l('FailedToDeletePriorityLevel'));
                        }
                    });
            }
        });
    }

    createPriorityLevel(): void {
        this.showCreateOrEditPriorityLevelDialog();
    }

    editPriorityLevel(priorityLevel: PriorityLevelDto): void {
        this.showCreateOrEditPriorityLevelDialog(priorityLevel.id);
    }

    showCreateOrEditPriorityLevelDialog(id?: number): void {
        let createOrEditPriorityLevelDialog: BsModalRef;
        if (!id) {
            createOrEditPriorityLevelDialog = this._modalService.show(CreatePriorityLevelDialogComponent, {
                class: 'modal-lg',
            });
        } else {
            createOrEditPriorityLevelDialog = this._modalService.show(EditPriorityLevelDialogComponent, {
                class: 'modal-lg',
                initialState: {
                    id: id,
                },
            });
        }

        createOrEditPriorityLevelDialog.content.onSave.subscribe(() => {
            this.refresh();
        });
    }

    refresh(): void {
        console.log('Refreshing priority levels list');
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

    trackById(index: number, priorityLevel: PriorityLevelDto): number {
        return priorityLevel.id;
    }

    getPercentageColor(percentage: number): string {
        const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
        let r, g, b;

        if (clampedPercentage <= 33) {
            // Transition from light green (#90EE90, RGB: 144, 238, 144) to dark green (#228B22, RGB: 34, 139, 34)
            const t = clampedPercentage / 33;
            r = Math.round(144 + (34 - 144) * t);
            g = Math.round(238 + (139 - 238) * t);
            b = Math.round(144 + (34 - 144) * t);
        } else if (clampedPercentage <= 66) {
            // Transition from light yellow (#FFFFE0, RGB: 255, 255, 224) to dark yellow (#FF8C00, RGB: 255, 140, 0)
            const t = (clampedPercentage - 34) / 33;
            r = Math.round(255 + (255 - 255) * t);
            g = Math.round(255 + (140 - 255) * t);
            b = Math.round(224 + (0 - 224) * t);
        } else {
            // Transition from light red (#FFB6C1, RGB: 255, 182, 193) to dark red (#8B0000, RGB: 139, 0, 0)
            const t = (clampedPercentage - 67) / 33;
            r = Math.round(255 + (139 - 255) * t);
            g = Math.round(182 + (0 - 182) * t);
            b = Math.round(193 + (0 - 193) * t);
        }

        return `rgb(${r}, ${g}, ${b})`;
    }
}