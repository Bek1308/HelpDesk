import { Component, Injector, OnInit, ChangeDetectorRef, NgZone, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IssuesServiceProxy } from '@shared/api-services/issues/issues.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, Subject, fromEvent, Subscription } from 'rxjs';
import { AppComponentBase } from '@shared/app-component-base';
import { ViewCallCenterIssueDialogComponent } from '@app/call-center-issues/view-call-center-issue-dialog/view-call-center-issue-dialog.component';
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
import { IssueCardComponent } from '@app/issues/issues-card/issues-card.component';

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
  selector: 'app-my-issues',
  templateUrl: './my-issues.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, LocalizePipe, NgStyle, IssueCardComponent],
})
export class MyIssuesComponent extends AppComponentBase implements OnInit, AfterViewInit, OnDestroy {
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
    { key: 'title', label: 'Title', selected: true },
    { key: 'priorityName', label: 'PriorityName', selected: true },
    { key: 'issueStatusName', label: 'StatusName', selected: true },
    { key: 'callcenterdata.subcategoryname', label: 'SubCategoryName', selected: true },
    { key: 'callcenterdata.servicename', label: 'ServiceName', selected: true },
    { key: 'callcenterdata.subscriber', label: 'Subscriber', selected: true },
    { key: 'creationtime', label: 'CreationTime', selected: false },
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
    'creationTimeInterval',
    'creationTimeCustom',
  ];
  priorities: Priority[] = [];
  statuses: Status[] = [];
  dropdownOpenId: number | null = null;
  dropdownPosition: { top: number; left: number } | null = null;
  private resizeSubscription: Subscription | null = null;
  private scrollSubscription: Subscription | null = null;
  viewMode: 'card' | 'table' = 'card';
  activeTab: 'myIssues' | 'assignedToMe' = 'myIssues';

  constructor(
    private injector: Injector,
    private _issuesService: IssuesServiceProxy,
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

    this.resizeSubscription = fromEvent(window, 'resize').pipe(debounceTime(100)).subscribe(() => {
      this.updateDropdownPosition();
    });
    this.scrollSubscription = fromEvent(window, 'scroll').pipe(debounceTime(100)).subscribe(() => {
      this.updateDropdownPosition();
    });
  }

  ngAfterViewInit(): void {}

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

  toggleViewMode(mode: 'card' | 'table'): void {
    this.viewMode = mode;
    this.cd.markForCheck();
  }

  switchTab(tab: 'myIssues' | 'assignedToMe'): void {
    this.activeTab = tab;
    this.currentPage = 0;
    this.list();
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

    if (this.activeTab === 'myIssues') {
      input.reportedBy = this.appSession.userId || undefined;
      input.assigneeUserId = undefined;
    } else {
      input.reportedBy = undefined;
      input.assigneeUserId = this.appSession.userId || undefined;
    }

    console.log(`"${this.activeTab === 'myIssues' ? 'Mening masalalarim' : 'Menga biriktirilgan'}" uchun so'rov yuborilmoqda, input:`, input);

    const serviceCall = this.activeTab === 'myIssues'
      ? this._issuesService.getMyIssuesAll(input)
      : this._issuesService.getAllAssigned(input);

    serviceCall
      .pipe(finalize(() => this.hideLoadingIndicator()))
      .subscribe({
        next: (result: IssuesDtoPagedResultDto) => {
          console.log(`"${this.activeTab === 'myIssues' ? 'getMyIssuesAll' : 'getAllAssigned'}" dan javob olindi:`, result);
          this.records = result.items || [];
          this.totalRecordsCount = result.totalCount;
          this.totalPages = Math.ceil(this.totalRecordsCount / this.recordsPerPage) || 1;
          this.cd.markForCheck();
        },
        error: (error) => {
          console.error(`"${this.activeTab === 'myIssues' ? 'Mening masalalarim' : 'Menga biriktirilgan'}" ni yuklashda xatolik:`, {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            errorDetails: error.error,
            url: error.url,
          });
          this.notify.error(this.l('FailedToLoadIssues'));
        },
      });
  }

  createIssue(): void {
    const modalRef: BsModalRef = this._modalService.show(CreateIssuesDialogComponent, {
      class: 'modal-lg modal-dialog-centered',
    });

    modalRef.onHidden.subscribe(() => {
      if (modalRef.content?.saved) {
        this.notify.success(this.l('SuccessfullySaved'));
        this.refresh();
      }
    });
  }

  editIssue(recordId: number): void {
    // const modalRef: BsModalRef = this._modalService.show(CreateIssuesDialogComponent, {
    //   class: 'modal-lg modal-dialog-centered',
    //   initialState: { issueId: recordId },
    // });

    // modalRef.onHidden.subscribe(() => {
    //   if (modalRef.content?.saved) {
    //     this.notify.success(this.l('SuccessfullySaved'));
    //     this.refresh();
    //   }
    // });
    // this.dropdownOpenId = null;
    // this.dropdownPosition = null;
    // this.cd.markForCheck();
  }

  viewIssue(recordId: number): void {
    this._modalService.show(ViewCallCenterIssueDialogComponent, {
      class: 'modal-lg',
      initialState: { id: recordId },
    });
    this.dropdownOpenId = null;
    this.dropdownPosition = null;
    this.cd.markForCheck();
  }

  deleteIssue(recordId: number): void {
    this.notify.warn('O\'chirish funksiyasi hali amalga oshirilmagan');
    this.dropdownOpenId = null;
    this.dropdownPosition = null;
    this.cd.markForCheck();
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
        endpointKey: 'MyIssues',
        allowedFilters: this.allowedFilters,
        filters: new GetAllIssuesInput(this.filters),
      },
    });
    modalRef.content.filtersApplied.subscribe((filters: GetAllIssuesInput) => {
      this.applyFilters(filters);
    });
    modalRef.content.closeModal.subscribe(() => {
      modalRef.hide();
    });
  }

  saveColumnPreferences(): void {
    localStorage.setItem('myIssuesColumns', JSON.stringify(this.availableColumns));
    this.selectedColumns = this.availableColumns.filter(col => col.selected);
  }

  loadColumnPreferences(): void {
    const saved = localStorage.getItem('myIssuesColumns');
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
    const cacheKey = `filters_MyIssues_${userId}`;
    localStorage.setItem(cacheKey, JSON.stringify(this.filters.toJSON()));
  }

  loadFilterPreferences(): void {
    const userId = this.appSession.userId || 'anonymous';
    const cacheKey = `filters_MyIssues_${userId}`;
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
      return 'bg-blue-500';
    }
    return 'bg-gray-500';
  }

  getColumnValue(record: IssuesDto, key: string): string {
    switch (key) {
      case 'title':
        return record.title || '';
      case 'priorityName':
        return record.priorityName || '';
      case 'issueStatusName':
        return record.issueStatusName || '';
      case 'callcenterdata.subcategoryname':
        return record.callCenterData?.subCategoryName || '';
      case 'callcenterdata.servicename':
        return record.callCenterData?.serviceName || '';
      case 'callcenterdata.subscriber':
        return record.callCenterData?.subscriber || '';
      case 'creationtime':
        return record.creationTime ? new Date(record.creationTime).toLocaleString() : '';
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

    const button = event
      ? (event.currentTarget as HTMLElement)
      : document.querySelector(`.dropdown-button[data-id="${this.dropdownOpenId}"]`) as HTMLElement;
    if (!button) {
      this.dropdownOpenId = null;
      this.dropdownPosition = null;
      this.cd.markForCheck();
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
    this.cd.markForCheck();
  }

  trackById(index: number, issue: IssuesDto): number {
    return issue.id;
  }
}