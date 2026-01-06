import { Component, Injector, OnInit, ChangeDetectorRef, NgZone, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { RepairIssuesServiceProxy } from '@shared/api-services/issues/repair-issues.service';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, Subject, fromEvent, Subscription } from 'rxjs';
import { AppComponentBase } from '@shared/app-component-base';
import { ColumnSelectionModalComponent } from '@shared/components/modal/column-selection-modal.component';
import { FilterModalComponent } from '@shared/components/modal/filter-modal.component';
import { GetAllIssuesInput, IssuesDto, IssuesDtoPagedResultDto } from '@shared/api-services/issues/model/issues-dto.model';
import { PriorityLevelServiceProxy } from '@shared/api-services/priority-level/priority-level.service';
import { IssuesStatusesServiceProxy } from '@shared/api-services/issues-statuses/issues-statuses.service';
import { UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { SubCategoryServiceProxy } from '@shared/api-services/sub-category/sub-category.service';
import { ServicesServiceProxy } from '@shared/api-services/services/services.service';
import { CreateIssuesDialogComponent } from '@app/issues/create-issues-dialog/create-issues-dialog.component';
import { EditIssuesDialogComponent } from '@app/issues/edit-issues-dialog/edit-issues-dialog.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { NgStyle } from '@angular/common';

interface Priority {
  id: number;
  name: string;
  percentage?: number;
}

interface Status {
  id: number;
  title: string;
}

@Component({
  selector: 'app-repair-issues',
  templateUrl: './repair-issues.component.html',
  animations: [appModuleAnimation()],
  standalone: true,
  imports: [FormsModule, CommonModule, LocalizePipe, NgStyle],
})
export class RepairIssuesComponent extends AppComponentBase implements OnInit, AfterViewInit, OnDestroy {
  records: IssuesDto[] = [];
  isLoading = false;
  predefinedRecordsCountPerPage = [5, 10, 25, 50, 100, 250, 500];
  recordsPerPage = 10;
  totalRecordsCount = 0;
  currentPage = 0;
  totalPages = 0;
  sortField: string = 'repairData.agentFullName';
  sortOrder: number = 1;
  isRecordsPerPageDropdownOpen: boolean = false;
  filters: GetAllIssuesInput = new GetAllIssuesInput();
  private searchSubject = new Subject<void>();
  availableColumns: { key: string; label: string; selected: boolean }[] = [
    { key: 'id', label: 'Id', selected: false },
    { key: 'title', label: 'Title', selected: true },
    { key: 'issuecategory', label: 'IssueCategory', selected: false },
    { key: 'description', label: 'Description', selected: false },
    { key: 'priorityName', label: 'PriorityName', selected: true },
    { key: 'issueStatusName', label: 'StatusName', selected: true },
    { key: 'reportedByName', label: 'ReportedByName', selected: false },
    { key: 'isresolved', label: 'IsResolved', selected: false },
    { key: 'deadline', label: 'Deadline', selected: false },
    { key: 'resolvedtime', label: 'ResolvedTime', selected: false },
    { key: 'creationtime', label: 'CreationTime', selected: false },
    { key: 'lastmodificationtime', label: 'LastModificationTime', selected: false },
    { key: 'assigneeuserids', label: 'AssigneeUserIds', selected: false },
    { key: 'repairdata.agentfullname', label: 'AgentFullName', selected: true },
    { key: 'repairdata.agentnumber', label: 'AgentNumber', selected: true },
    { key: 'repairdata.equipment', label: 'Equipment', selected: true },
    { key: 'repairdata.serialnumber', label: 'SerialNumber', selected: true },
    { key: 'repairdata.issuedescription', label: 'IssueDescription', selected: true },
    { key: 'repairdata.workamount', label: 'WorkAmount', selected: false },
    { key: 'repairdata.replacementparts', label: 'ReplacementParts', selected: false },
  ];
  selectedColumns: { key: string; label: string; selected: boolean }[] = [];
    allowedFilters: string[] = [
    'priorityId',
    'issueStatusId',
    'assigneeUserIds',
    'reportedBy',
    'isResolved',
    'deadlineInterval',
    'deadlineCustom',
    'resolvedTimeInterval',
    'resolvedTimeCustom',
    'creationTimeInterval',
    'creationTimeCustom',
    'lastModificationTimeInterval',
    'lastModificationTimeCustom',
  ];
  priorities: Priority[] = [];
  statuses: Status[] = [];
  dropdownOpenId: number | null = null;
  dropdownPosition: { top: number; left: number } | null = null;
  private resizeSubscription: Subscription | null = null;
  private scrollSubscription: Subscription | null = null;

  constructor(
    private injector: Injector,
    private _repairIssuesService: RepairIssuesServiceProxy,
    private _modalService: BsModalService,
    private _activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private priorityService: PriorityLevelServiceProxy,
    private issueStatusService: IssuesStatusesServiceProxy,
    private userService: UserServiceProxy,
    private subCategoryService: SubCategoryServiceProxy,
    private serviceService: ServicesServiceProxy
  ) {
    super(injector);
    this.loadColumnPreferences();
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 0;
      this.list();
    });
  }

  ngOnInit(): void {
    this.filters.keyword = this._activatedRoute.snapshot.queryParams['keyword'] || this.filters.keyword || '';
    this.loadPrioritiesAndStatuses();
    this.loadFilterPreferences();
    this.list();
    console.log('Initial selected columns:', this.selectedColumns);
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.dropdownOpenId !== null && !target.closest('.dropdown-button') && !target.closest('.dropdown-menu')) {
      this.dropdownOpenId = null;
      this.dropdownPosition = null;
      this.cd.detectChanges();
    }
  }

  loadPrioritiesAndStatuses(): void {
    this.priorityService.getAll(undefined, undefined, 0, 1000).subscribe(data => {
      this.priorities = data.items?.map(item => ({ id: item.id, name: item.title, percentage: item.percentage })) || [];
      this.cd.detectChanges();
    });
    this.issueStatusService.getAll(undefined, undefined, 0, 1000).subscribe(data => {
      this.statuses = data.items?.map(item => ({ id: item.id, title: item.title })) || [];
      this.cd.detectChanges();
    });
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
    if (this.sortField === field) {
      this.sortOrder = -this.sortOrder;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }
    this.list();
  }

  clearFilters(): void {
    this.filters = new GetAllIssuesInput();
    this.saveFilterPreferences();
    this.currentPage = 0;
    this.list();
  }

  applyFilters(filters: GetAllIssuesInput): void {
    this.filters = new GetAllIssuesInput(filters);
    console.log('Applied filters:', this.filters.toJSON());
    this.saveFilterPreferences();
    this.currentPage = 0;
    this.list();
  }

  debouncedList(): void {
    this.saveFilterPreferences();
    this.searchSubject.next();
  }

  list(): void {
    this.showLoadingIndicator();
    const input = new GetAllIssuesInput({
      ...this.filters,
      skipCount: this.getSkipCount(),
      maxResultCount: this.getMaxResultCount(),
      sorting: this.getSorting(),
    });
    console.log('Sending request with filters:', input.toJSON());
    this._repairIssuesService
      .getAll(input)
      .pipe(finalize(() => this.hideLoadingIndicator()))
      .subscribe({
        next: (result: IssuesDtoPagedResultDto) => {
          console.log('Backend response:', result);
          this.records = result.items || [];
          console.log('Records assigned:', this.records);
          this.totalRecordsCount = result.totalCount;
          this.totalPages = Math.ceil(this.totalRecordsCount / this.recordsPerPage) || 1;
          this.cd.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching repair issues:', error);
          this.notify.error(this.l('FailedToLoadRepairIssues'));
          this.cd.detectChanges();
        },
      });
  }

  delete(recordId: number): void {
    this.dropdownOpenId = null;
    this.dropdownPosition = null;
    this.cd.detectChanges();
  }

  createRepairIssue(): void {
    this.showCreateOrEditRepairIssueDialog();
  }

  editRepairIssue(recordId: number): void {
    this.showCreateOrEditRepairIssueDialog(recordId);
    this.dropdownOpenId = null;
    this.dropdownPosition = null;
    this.cd.detectChanges();
  }

  viewRepairIssue(recordId: number): void {
    // this._modalService.show(ViewIssueDialogComponent, {
    //   class: 'modal-lg',
    //   initialState: { id: recordId },
    // });
    // this.dropdownOpenId = null;
    // this.dropdownPosition = null;
    // this.cd.detectChanges();
  }

  showCreateOrEditRepairIssueDialog(id?: number): void {
    let modalRef: BsModalRef;
    if (id) {
      modalRef = this._modalService.show(
        EditIssuesDialogComponent,
        {
          class: 'modal-lg modal-dialog-centered',
          initialState: {
            issueId: id,
          },
        }
      );
    } else {
      modalRef = this._modalService.show(
        CreateIssuesDialogComponent,
        {
          class: 'modal-lg modal-dialog-centered',
          initialState: {},
        }
      );
    }

    modalRef.onHidden.subscribe(() => {
      if (modalRef.content?.saved) {
        this.notify.success(this.l('SuccessfullySaved'));
        this.refresh();
      }
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
    this.isRecordsPerPageDropdownOpen = false;
    this.currentPage = 0;
    this.list();
  }

  showColumnSelectionModal(): void {
    const modalRef = this._modalService.show(ColumnSelectionModalComponent, {
      class: 'modal-lg',
      initialState: {
        availableColumns: JSON.parse(JSON.stringify(this.availableColumns)),
      },
    });
    modalRef.content.saveColumns.subscribe((columns: { key: string; label: string; selected: boolean }[]) => {
      this.availableColumns = columns;
      this.selectedColumns = columns.filter(col => col.selected);
      console.log('Updated selected columns:', this.selectedColumns);
      this.saveColumnPreferences();
      this.cd.detectChanges();
    });
  }

  showFilterModal(): void {
    const modalRef = this._modalService.show(FilterModalComponent, {
      class: 'modal-lg',
      initialState: {
        endpointKey: 'RepairIssues',
        allowedFilters: this.allowedFilters,
        filters: new GetAllIssuesInput(this.filters),
      },
    });
    modalRef.content.filtersApplied.subscribe((filters: GetAllIssuesInput) => {
      console.log('Filters applied from modal:', filters.toJSON());
      this.applyFilters(filters);
    });
    modalRef.content.closeModal.subscribe(() => {
      modalRef.hide();
    });
  }

  saveColumnPreferences(): void {
    localStorage.setItem('repairIssuesColumns', JSON.stringify(this.availableColumns));
    this.selectedColumns = this.availableColumns.filter(col => col.selected);
    console.log('Saved columns:', this.selectedColumns);
  }

  loadColumnPreferences(): void {
    const saved = localStorage.getItem('repairIssuesColumns');
    console.log('Saved columns from localStorage:', saved);
    if (saved) {
      const parsed = JSON.parse(saved);
      this.availableColumns = this.availableColumns.map(col => ({
        ...col,
        selected: parsed.find((p: any) => p.key === col.key)?.selected ?? col.selected,
      }));
    }
    this.selectedColumns = this.availableColumns.filter(col => col.selected);
    console.log('Loaded selected columns:', this.selectedColumns);
  }

  saveFilterPreferences(): void {
    const userId = this.appSession.userId || 'anonymous';
    const cacheKey = `filters_RepairIssues_${userId}`;
    localStorage.setItem(cacheKey, JSON.stringify(this.filters.toJSON()));
    console.log('Saved filters:', this.filters.toJSON());
  }

  loadFilterPreferences(): void {
    const userId = this.appSession.userId || 'anonymous';
    const cacheKey = `filters_RepairIssues_${userId}`;
    const savedFilters = localStorage.getItem(cacheKey);
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      this.filters = GetAllIssuesInput.fromJS(parsed);
      console.log('Loaded filters:', this.filters.toJSON());
    }
  }

  getPriorityColor(record: IssuesDto): string {
    const priority = this.priorities.find(p => p.name === record.priorityName);
    const percentage = Math.min(Math.max(priority?.percentage || 0, 0), 100);
    let r, g, b;

    if (percentage <= 33) {
      const t = percentage / 33;
      r = Math.round(144 + (34 - 144) * t);
      g = Math.round(238 + (139 - 238) * t);
      b = Math.round(144 + (34 - 144) * t);
    } else if (percentage <= 66) {
      const t = (percentage - 34) / 33;
      r = Math.round(255 + (255 - 255) * t);
      g = Math.round(255 + (140 - 255) * t);
      b = Math.round(224 + (0 - 224) * t);
    } else {
      const t = (percentage - 67) / 33;
      r = Math.round(255 + (139 - 255) * t);
      g = Math.round(182 + (0 - 182) * t);
      b = Math.round(193 + (0 - 193) * t);
    }

    return `rgb(${r}, ${g}, ${b})`;
  }

  getStatusColor(statusName: string): string {
    const normalizedStatus = statusName.toLowerCase();
    if (['completed', 'завершено', 'анҷом ёфт'].includes(normalizedStatus)) {
      return 'bg-green-500';
    } else if (['in progress', 'в процессе', 'дар раванд'].includes(normalizedStatus)) {
      return 'bg-yellow-500';
    } else if (['new', 'новый', 'нав'].includes(normalizedStatus)) {
      return 'bg-red-500';
    }
    return 'bg-gray-500';
  }

  getColumnValue(record: IssuesDto, key: string): string {
    switch (key) {
      case 'id':
        return record.id?.toString() || '';
      case 'title':
        return record.title || '';
      case 'issuecategory':
        return record.issueCategory || '';
      case 'description':
        return record.description || '';
      case 'priorityName':
        return record.priorityName || '';
      case 'issueStatusName':
        return record.issueStatusName || '';
      case 'reportedByName':
        return record.reportedByName || '';
      case 'isresolved':
        return record.isResolved ? 'Yes' : 'No';
      case 'deadline':
        return record.deadline ? new Date(record.deadline).toLocaleString() : '';
      case 'resolvedtime':
        return record.resolvedTime ? new Date(record.resolvedTime).toLocaleString() : '';
      case 'creationtime':
        return record.creationTime ? new Date(record.creationTime).toLocaleString() : '';
      case 'lastmodificationtime':
        return record.lastModificationTime ? new Date(record.lastModificationTime).toLocaleString() : '';
      case 'assigneeuserids':
        return record.assigneeUserIds?.length?.toString() || '0';
      case 'repairdata.agentfullname':
        return record.repairData?.agentFullName || '';
      case 'repairdata.agentnumber':
        return record.repairData?.agentNumber || '';
      case 'repairdata.equipment':
        return record.repairData?.equipment || '';
      case 'repairdata.serialnumber':
        return record.repairData?.serialNumber || '';
      case 'repairdata.issuedescription':
        return record.repairData?.issueDescription || '';
      case 'repairdata.workamount':
        return record.repairData?.workAmount !== undefined ? record.repairData.workAmount.toString() : '0';
      case 'repairdata.replacementparts':
        return record.repairData?.replacementParts || '';
      default:
        return '';
    }
  }

  toggleDropdown(recordId: number, event: MouseEvent): void {
    event.stopPropagation();
    if (this.dropdownOpenId === recordId) {
      this.dropdownOpenId = null;
      this.dropdownPosition = null;
    } else {
      this.dropdownOpenId = recordId;
      this.updateDropdownPosition(event);
    }
    this.cd.detectChanges();
  }

  updateDropdownPosition(event?: MouseEvent): void {
    if (this.dropdownOpenId === null) return;

    const button = event ? (event.currentTarget as HTMLElement) : document.querySelector(`.dropdown-button[data-id="${this.dropdownOpenId}"]`) as HTMLElement;
    if (!button) {
      this.dropdownOpenId = null;
      this.dropdownPosition = null;
      this.cd.detectChanges();
      return;
    }

    const rect = button.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const dropdownWidth = 192;
    let left = rect.left + window.scrollX;

    if (left + dropdownWidth > windowWidth) {
      left = windowWidth - dropdownWidth - 10;
    }

    this.dropdownPosition = {
      top: rect.bottom + window.scrollY + 2,
      left: Math.max(left, 10),
    };
    this.cd.detectChanges();
  }

  trackById(index: number, repairIssue: IssuesDto): number {
    return repairIssue.id;
  }
}