import { Component, Injector, OnInit, ChangeDetectorRef, NgZone, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CallCenterIssuesServiceProxy } from '@shared/api-services/issues/call-center-issues.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, Subject, fromEvent, Subscription } from 'rxjs';
import { AppComponentBase } from '@shared/app-component-base';
import { ViewCallCenterIssueDialogComponent } from './view-call-center-issue-dialog/view-call-center-issue-dialog.component';
import { ColumnSelectionModalComponent } from '@shared/components/modal/column-selection-modal.component';
import { FilterModalComponent } from '@shared/components/modal/filter-modal.component';
import { GetAllIssuesInput, IssuesDto, IssuesDtoPagedResultDto } from '@shared/api-services/issues/model/issues-dto.model';
import { PriorityLevelServiceProxy } from '@shared/api-services/priority-level/priority-level.service';
import { IssuesStatusesServiceProxy } from '@shared/api-services/issues-statuses/issues-statuses.service';
import { UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { SubCategoryServiceProxy } from '@shared/api-services/sub-category/sub-category.service';
import { ServicesServiceProxy } from '@shared/api-services/services/services.service';
import { NgStyle } from '@angular/common';
import { CreateIssuesDialogComponent } from '@app/issues/create-issues-dialog/create-issues-dialog.component';
import { EditIssuesDialogComponent } from '@app/issues/edit-issues-dialog/edit-issues-dialog.component';

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
  selector: 'app-call-center-issues',
  templateUrl: './call-center-issues.component.html',
  animations: [appModuleAnimation()],
  standalone: true,
  imports: [FormsModule, CommonModule, LocalizePipe, NgStyle],
})
export class CallCenterIssuesComponent extends AppComponentBase implements OnInit, AfterViewInit, OnDestroy {
  records: IssuesDto[] = [];
  isLoading = false;
  predefinedRecordsCountPerPage = [5, 10, 25, 50, 100, 250, 500];
  recordsPerPage = 10;
  totalRecordsCount = 0;
  currentPage = 0;
  totalPages = 0;
  sortField: string = 'subCategoryName';
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
    { key: 'callcenterdata.subcategoryname', label: 'SubCategoryName', selected: true },
    { key: 'callcenterdata.servicename', label: 'ServiceName', selected: true },
    { key: 'callcenterdata.subscriber', label: 'Subscriber', selected: true },
    { key: 'callcenterdata.wrongnumber', label: 'WrongNumber', selected: false },
    { key: 'callcenterdata.rightnumber', label: 'RightNumber', selected: false },
    { key: 'callcenterdata.terminalnumber', label: 'TerminalNumber', selected: false },
    { key: 'callcenterdata.sum', label: 'Sum', selected: false },
    { key: 'callcenterdata.cancelledsum', label: 'CancelledSum', selected: false },
  ];
  selectedColumns: { key: string; label: string; selected: boolean }[] = [];
  allowedFilters: string[] = [
    'priorityId',
    'issueStatusId',
    'assigneeUserIds',
    'subCategoryId',
    'serviceId',
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
    'sum',
    'cancelledSum',
  ];
  priorities: Priority[] = [];
  statuses: Status[] = [];
  dropdownOpenId: number | null = null;
  dropdownPosition: { top: number; left: number } | null = null;
  private resizeSubscription: Subscription | null = null;
  private scrollSubscription: Subscription | null = null;

  constructor(
    private injector: Injector,
    private _callCenterIssuesService: CallCenterIssuesServiceProxy,
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

    // Subscribe to window resize and scroll events
    this.resizeSubscription = fromEvent(window, 'resize').pipe(debounceTime(100)).subscribe(() => {
      this.updateDropdownPosition();
    });
    this.scrollSubscription = fromEvent(window, 'scroll').pipe(debounceTime(100)).subscribe(() => {
      this.updateDropdownPosition();
    });
  }

  ngAfterViewInit(): void {
    // No FeatherIconService needed as SVG icons are used directly
  }

  ngOnDestroy(): void {
    // Unsubscribe from window events to prevent memory leaks
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
      this.cd.markForCheck();
    }
  }

  loadPrioritiesAndStatuses(): void {
    this.priorityService.getAll(undefined, undefined, 0, 1000).subscribe(data => {
      this.priorities = data.items?.map(item => ({ id: item.id, name: item.title, percentage: item.percentage })) || [];
      this.cd.markForCheck();
    });
    this.issueStatusService.getAll(undefined, undefined, 0, 1000).subscribe(data => {
      this.statuses = data.items?.map(item => ({ id: item.id, title: item.title })) || [];
      this.cd.markForCheck();
    });
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
    this.filters = new GetAllIssuesInput();
    this.saveFilterPreferences();
    this.currentPage = 0;
    this.list();
  }

  applyFilters(filters: GetAllIssuesInput): void {
    this.filters = new GetAllIssuesInput(filters);
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
    this._callCenterIssuesService
      .getAll(input)
      .pipe(finalize(() => this.hideLoadingIndicator()))
      .subscribe({
        next: (result: IssuesDtoPagedResultDto) => {
          this.records = result.items || [];
          this.totalRecordsCount = result.totalCount;
          this.totalPages = Math.ceil(this.totalRecordsCount / this.recordsPerPage) || 1;
          this.cd.markForCheck();
        },
        error: (error) => {
          console.error('Error fetching call center issues:', error);
          this.notify.error(this.l('FailedToLoadCallCenterIssues'));
        },
      });
  }

  delete(recordId: number): void {
    // Placeholder: Delete logic will be implemented later
    this.dropdownOpenId = null;
    this.dropdownPosition = null;
    this.cd.markForCheck();
  }

  createCallCenterIssue(): void {
    this.showCreateOrEditCallCenterIssueDialog();
  }

  editCallCenterIssue(recordId: number): void {
    this.showCreateOrEditCallCenterIssueDialog(recordId);
    this.dropdownOpenId = null;
    this.dropdownPosition = null;
    this.cd.markForCheck();
  }

  viewCallCenterIssue(recordId: number): void {
    this._modalService.show(ViewCallCenterIssueDialogComponent, {
      class: 'modal-lg',
      initialState: { id: recordId },
    });
    this.dropdownOpenId = null;
    this.dropdownPosition = null;
    this.cd.markForCheck();
  }

showCreateOrEditCallCenterIssueDialog(id?: number): void {
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
      this.saveColumnPreferences();
      this.cd.markForCheck();
    });
  }

  showFilterModal(): void {
    const modalRef = this._modalService.show(FilterModalComponent, {
      class: 'modal-lg',
      initialState: {
        endpointKey: 'CallCenterIssues',
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
    localStorage.setItem('callCenterIssuesColumns', JSON.stringify(this.availableColumns));
    this.selectedColumns = this.availableColumns.filter(col => col.selected);
  }

  loadColumnPreferences(): void {
    const saved = localStorage.getItem('callCenterIssuesColumns');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.availableColumns = this.availableColumns.map(col => ({
        ...col,
        selected: parsed.find((p: any) => p.key === col.key)?.selected ?? col.selected,
      }));
    }
    this.selectedColumns = this.availableColumns.filter(col => col.selected);
  }

  saveFilterPreferences(): void {
    const userId = this.appSession.userId || 'anonymous';
    const cacheKey = `filters_CallCenterIssues_${userId}`;
    localStorage.setItem(cacheKey, JSON.stringify(this.filters.toJSON()));
  }

  loadFilterPreferences(): void {
    const userId = this.appSession.userId || 'anonymous';
    const cacheKey = `filters_CallCenterIssues_${userId}`;
    const savedFilters = localStorage.getItem(cacheKey);
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      this.filters = GetAllIssuesInput.fromJS(parsed);
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
      case 'callcenterdata.subcategoryname':
        return record.callCenterData?.subCategoryName || '';
      case 'callcenterdata.servicename':
        return record.callCenterData?.serviceName || '';
      case 'callcenterdata.subscriber':
        return record.callCenterData?.subscriber || '';
      case 'callcenterdata.wrongnumber':
        return record.callCenterData?.wrongNumber || '';
      case 'callcenterdata.rightnumber':
        return record.callCenterData?.rightNumber || '';
      case 'callcenterdata.terminalnumber':
        return record.callCenterData?.terminalNumber || '';
      case 'callcenterdata.sum':
        return record.callCenterData?.sum !== undefined ? record.callCenterData.sum.toString() : '0';
      case 'callcenterdata.cancelledsum':
        return record.callCenterData?.cancelledSum !== undefined ? record.callCenterData.cancelledSum.toString() : '0';
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
    this.cd.markForCheck();
  }

  updateDropdownPosition(event?: MouseEvent): void {
    if (this.dropdownOpenId === null) return;

    const button = event ? (event.currentTarget as HTMLElement) : document.querySelector(`.dropdown-button[data-id="${this.dropdownOpenId}"]`) as HTMLElement;
    if (!button) {
      this.dropdownOpenId = null;
      this.dropdownPosition = null;
      this.cd.markForCheck();
      return;
    }

    const rect = button.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const dropdownWidth = 192; // w-48 = 192px (Tailwind: 1rem = 16px, 48/4 = 12rem = 192px)
    let left = rect.left + window.scrollX;

    if (left + dropdownWidth > windowWidth) {
      left = windowWidth - dropdownWidth - 10;
    }

    this.dropdownPosition = {
      top: rect.bottom + window.scrollY + 2,
      left: Math.max(left, 10),
    };
    this.cd.markForCheck();
  }

  trackById(index: number, callCenterIssue: IssuesDto): number {
    return callCenterIssue.id;
  }
}