import { Component, EventEmitter, Injector, Input, OnInit, Output, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GetAllIssuesInput } from '@shared/api-services/issues/model/issues-dto.model';
import { PriorityLevelServiceProxy } from '@shared/api-services/priority-level/priority-level.service';
import { IssuesStatusesServiceProxy } from '@shared/api-services/issues-statuses/issues-statuses.service';
import { UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { SubCategoryServiceProxy } from '@shared/api-services/sub-category/sub-category.service';
import { ServicesServiceProxy } from '@shared/api-services/services/services.service';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { CommonModule } from '@angular/common';
import { AbpModalHeaderComponent } from './abp-modal-header.component';
import { AbpModalFooterComponent } from './abp-modal-footer.component';
import { AppComponentBase } from '@shared/app-component-base';

interface FilterDefinition {
  key: string;
  label: string;
  type: 'select' | 'boolean' | 'dateRange' | 'number';
  options?: { id: number | boolean; name: string }[];
  intervals?: { label: string; start: Date | null; end: Date | null }[];
  isCustom?: boolean;
}

interface ActiveFilter {
  key: string;
  label: string;
  type: 'select' | 'boolean' | 'dateRange' | 'number';
  value: any;
  isCustom?: boolean;
}

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LocalizePipe,
    AbpModalHeaderComponent,
    AbpModalFooterComponent,
  ],
})
export class FilterModalComponent extends AppComponentBase implements OnInit {
  @Input() endpointKey: string;
  @Input() allowedFilters: string[] = [];
  @Input() filters: GetAllIssuesInput = new GetAllIssuesInput();
  @Output() filtersApplied = new EventEmitter<GetAllIssuesInput>();
  @Output() closeModal = new EventEmitter<void>();

  activeFilters: ActiveFilter[] = [];
  availableFilters: FilterDefinition[] = [];
  isAddFilterDropdownOpen = false;
  dropdownOpen: string | null = null;
  fieldOptions: { [key: string]: { id: number | boolean; name: string }[] } = {};

  private filterDefinitions: FilterDefinition[] = [
    { key: 'priorityId', label: 'Priority', type: 'select', options: [] },
    { key: 'issueStatusId', label: 'Status', type: 'select', options: [] },
    { key: 'assigneeUserIds', label: 'Assignee', type: 'select', options: [] },
    { key: 'subCategoryId', label: 'Sub Category', type: 'select', options: [] },
    { key: 'serviceId', label: 'Service', type: 'select', options: [] },
    { key: 'reportedBy', label: 'Reported By', type: 'select', options: [] },
    { key: 'sum', label: 'Sum', type: 'number' },
    { key: 'cancelledSum', label: 'Cancelled Sum', type: 'number' },
    {
      key: 'isResolved',
      label: 'Resolved Status',
      type: 'boolean',
      options: [
        { id: true, name: 'Resolved' },
        { id: false, name: 'Not Resolved' },
      ],
    },
    {
      key: 'deadlineInterval',
      label: 'Deadline Interval',
      type: 'dateRange',
      intervals: this.getIntervals(),
    },
    {
      key: 'deadlineCustom',
      label: 'Deadline Custom',
      type: 'dateRange',
      isCustom: true,
    },
    {
      key: 'resolvedTimeInterval',
      label: 'Resolved Time Interval',
      type: 'dateRange',
      intervals: this.getIntervals(),
    },
    {
      key: 'resolvedTimeCustom',
      label: 'Resolved Time Custom',
      type: 'dateRange',
      isCustom: true,
    },
    {
      key: 'creationTimeInterval',
      label: 'Creation Time Interval',
      type: 'dateRange',
      intervals: this.getIntervals(),
    },
    {
      key: 'creationTimeCustom',
      label: 'Creation Time Custom',
      type: 'dateRange',
      isCustom: true,
    },
    {
      key: 'lastModificationTimeInterval',
      label: 'Last Modification Time Interval',
      type: 'dateRange',
      intervals: this.getIntervals(),
    },
    {
      key: 'lastModificationTimeCustom',
      label: 'Last Modification Time Custom',
      type: 'dateRange',
      isCustom: true,
    },
  ];

  constructor(
    injector: Injector,
    private priorityService: PriorityLevelServiceProxy,
    private issueStatusService: IssuesStatusesServiceProxy,
    private userService: UserServiceProxy,
    private subCategoryService: SubCategoryServiceProxy,
    private serviceService: ServicesServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadFieldOptions();
    this.loadFiltersFromInput();
    this.loadFiltersFromCache();
    this.updateAvailableFilters();
  }

  getDisplayValue(filter: ActiveFilter): string {
    if (filter.type === 'select') {
      const filterDef = this.filterDefinitions.find(f => f.key === filter.key);
      const option = filterDef?.options?.find(o => o.id === filter.value);
      return option ? option.name : 'All';
    } else if (filter.type === 'boolean') {
      return filter.value !== null ? (filter.value ? 'Yes' : 'No') : 'All';
    } else if (filter.type === 'dateRange' && !filter.isCustom) {
      return filter.value?.label || 'Select Interval';
    } else if (filter.type === 'dateRange' && filter.isCustom) {
      const start = filter.value?.start ? new Date(filter.value.start).toLocaleString() : '';
      const end = filter.value?.end ? new Date(filter.value.end).toLocaleString() : '';
      return start || end ? `${start} - ${end}` : 'Select Dates';
    } else if (filter.type === 'number') {
      const min = filter.value?.min || '';
      const max = filter.value?.max || '';
      return min || max ? `${min} - ${max}` : 'Enter Range';
    }
    return 'All';
  }

  getFilterDefinition(key: string): FilterDefinition | undefined {
    return this.filterDefinitions.find(f => f.key === key);
  }

  private getIntervals(): { label: string; start: Date | null; end: Date | null }[] {
    const now = new Date();
    return [
      {
        label: 'Today',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
      },
      {
        label: 'Yesterday',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999),
      },
      {
        label: 'Last7Days',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
        end: new Date(now),
      },
      {
        label: 'Last14Days',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14),
        end: new Date(now),
      },
      {
        label: 'Last30Days',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30),
        end: new Date(now),
      },
      {
        label: 'ThisWeek',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)),
        end: new Date(now),
      },
      {
        label: 'LastWeek',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) - 7),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() === 0 ? 0 : now.getDay())),
      },
      {
        label: 'ThisMonth',
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now),
      },
      {
        label: 'LastMonth',
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0),
      },
      {
        label: 'ThisYear',
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now),
      },
      {
        label: 'LastYear',
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear() - 1, 11, 31),
      },
    ];
  }

  private loadFieldOptions(): void {
    this.priorityService.getAll(undefined, undefined, 0, 1000).subscribe({
      next: data => {
        this.fieldOptions['priorityId'] = data.items?.map(item => ({ id: item.id, name: item.title })) || [];
        this.updateFilterOptions('priorityId');
        this.updateActiveFilters();
        this.updateAvailableFilters();
      },
      error: error => {
        console.error('Error fetching priorities:', error);
        this.notify.error(this.l('FailedToLoadPriorities'));
      },
    });
    this.issueStatusService.getAll(undefined, undefined, 0, 1000).subscribe({
      next: data => {
        this.fieldOptions['issueStatusId'] = data.items?.map(item => ({ id: item.id, name: item.titleRu || item.title })) || [];
        this.updateFilterOptions('issueStatusId');
        this.updateActiveFilters();
        this.updateAvailableFilters();
      },
      error: error => {
        console.error('Error fetching issue statuses:', error);
        this.notify.error(this.l('FailedToLoadIssueStatuses'));
      },
    });
    this.userService.getAll(undefined, undefined, undefined, 0, 1000).subscribe({
      next: data => {
        this.fieldOptions['assigneeUserIds'] = data.items?.map(item => ({ id: item.id, name: item.fullName || item.userName })) || [];
        this.fieldOptions['reportedBy'] = data.items?.map(item => ({ id: item.id, name: item.fullName || item.userName })) || [];
        this.updateFilterOptions('assigneeUserIds');
        this.updateFilterOptions('reportedBy');
        this.updateActiveFilters();
        this.updateAvailableFilters();
      },
      error: error => {
        console.error('Error fetching users:', error);
        this.notify.error(this.l('FailedToLoadUsers'));
      },
    });
    this.subCategoryService.getAll(undefined, undefined, 0, 1000).subscribe({
      next: data => {
        this.fieldOptions['subCategoryId'] = data.items?.map(item => ({ id: item.id, name: item.title })) || [];
        this.updateFilterOptions('subCategoryId');
        this.updateActiveFilters();
        this.updateAvailableFilters();
      },
      error: error => {
        console.error('Error fetching subcategories:', error);
        this.notify.error(this.l('FailedToLoadSubCategories'));
      },
    });
    this.serviceService.getAll(undefined, undefined, 0, 1000).subscribe({
      next: data => {
        this.fieldOptions['serviceId'] = data.items?.map(item => ({ id: item.id, name: item.name })) || [];
        this.updateFilterOptions('serviceId');
        this.updateActiveFilters();
        this.updateAvailableFilters();
      },
      error: error => {
        console.error('Error fetching services:', error);
        this.notify.error(this.l('FailedToLoadServices'));
      },
    });
  }

  private updateFilterOptions(key: string): void {
    const filter = this.filterDefinitions.find(f => f.key === key);
    if (filter && filter.type === 'select') {
      filter.options = this.fieldOptions[key] || [];
    }
  }

  private updateActiveFilters(): void {
    this.activeFilters = this.activeFilters.map(filter => {
      const def = this.getFilterDefinition(filter.key);
      if (!def) return filter;
      return {
        ...filter,
        label: def.label,
        type: def.type,
        isCustom: def.isCustom || false,
        options: def.type === 'select' ? this.fieldOptions[filter.key] || [] : def.options,
      };
    });
  }

  private loadFiltersFromInput(): void {
    if (!this.filters) return;

    this.activeFilters = [];
    Object.keys(this.filters.toJSON()).forEach(key => {
      if (this.allowedFilters.includes(key) && this.filters[key] !== undefined) {
        const def = this.getFilterDefinition(key);
        if (def) {
          this.activeFilters.push({
            key: def.key,
            label: def.label,
            type: def.type,
            value: this.filters[key],
            isCustom: def.isCustom || false,
          });
        }
      } else if (key.endsWith('Start') || key.endsWith('End')) {
        const baseKey = key.replace('Start', '').replace('End', '');
        const intervalKey = `${baseKey}Interval`;
        const customKey = `${baseKey}Custom`;
        if (this.allowedFilters.includes(intervalKey) || this.allowedFilters.includes(customKey)) {
          const def = this.getFilterDefinition(this.filters[`${baseKey}Interval`] ? intervalKey : customKey);
          if (def) {
            const existingFilter = this.activeFilters.find(f => f.key === def.key);
            if (!existingFilter) {
              const value = {
                start: this.filters[`${baseKey}Start`] ? new Date(this.filters[`${baseKey}Start`]) : null,
                end: this.filters[`${baseKey}End`] ? new Date(this.filters[`${baseKey}End`]) : null,
                label: this.filters[`${baseKey}Interval`] ? this.getIntervalLabel(this.filters[`${baseKey}Start`], this.filters[`${baseKey}End`]) : null,
              };
              this.activeFilters.push({
                key: def.key,
                label: def.label,
                type: def.type,
                value,
                isCustom: def.isCustom || false,
              });
            }
          }
        }
      }
    });
    this.updateAvailableFilters();
  }

  private loadFiltersFromCache(): void {
    const userId = this.getUserId();
    const cacheKey = `filters_${this.endpointKey}_${userId}`;
    const cachedFilters = localStorage.getItem(cacheKey);
    if (cachedFilters) {
      const parsed = JSON.parse(cachedFilters);
      this.filters = GetAllIssuesInput.fromJS(parsed.filters || {});
      this.activeFilters = parsed.activeFilters || [];
      this.activeFilters = this.activeFilters.filter(f => this.allowedFilters.includes(f.key)).map(filter => {
        const def = this.getFilterDefinition(filter.key);
        if (!def) return filter;
        let value = filter.value;
        if (filter.type === 'dateRange' && filter.value) {
          value = {
            start: filter.value.start ? new Date(filter.value.start) : null,
            end: filter.value.end ? new Date(filter.value.end) : null,
            label: filter.value.label || null,
          };
        } else if (filter.type === 'number' && filter.value) {
          value = { min: filter.value.min || null, max: filter.value.max || null };
        }
        return {
          key: filter.key,
          label: def.label,
          type: def.type,
          isCustom: def.isCustom || false,
          value,
          options: def.type === 'select' ? this.fieldOptions[filter.key] || [] : def.options,
        };
      });
      this.updateAvailableFilters();
    }
  }

  private getIntervalLabel(start: Date | null, end: Date | null): string | null {
    if (!start || !end) return null;
    const intervals = this.getIntervals();
    const found = intervals.find(interval => {
      return interval.start && interval.end &&
        interval.start.getTime() === new Date(start).getTime() &&
        interval.end.getTime() === new Date(end).getTime();
    });
    return found ? found.label : null;
  }

  private saveFiltersToCache(): void {
    const userId = this.getUserId();
    const cacheKey = `filters_${this.endpointKey}_${userId}`;
    const cacheData = {
      filters: this.filters.toJSON(),
      activeFilters: this.activeFilters.map(f => ({
        key: f.key,
        label: f.label,
        type: f.type,
        isCustom: f.isCustom,
        value: f.type === 'dateRange' && f.value ? {
          start: f.value.start ? f.value.start.toISOString() : null,
          end: f.value.end ? f.value.end.toISOString() : null,
          label: f.value.label || null,
        } : f.type === 'number' ? {
          min: f.value.min || null,
          max: f.value.max || null,
        } : f.value,
      })),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  }

  private getUserId(): string {
    return this.appSession.userId.toString() || 'anonymous';
  }

  private updateAvailableFilters(): void {
    console.log('Updating availableFilters:', {
      activeFilters: this.activeFilters.map(f => f.key),
      allowedFilters: this.allowedFilters,
      filterDefinitions: this.filterDefinitions.map(f => f.key),
      availableFilters: this.availableFilters.map(f => f.key),
    });
    this.availableFilters = this.filterDefinitions
      .filter(f => !this.activeFilters.some(af => af.key === f.key))
      .filter(f => this.allowedFilters.length === 0 || this.allowedFilters.includes(f.key));
    console.log('Updated availableFilters:', this.availableFilters.map(f => f.key));
  }

  toggleAddFilterDropdown(): void {
    console.log('toggleAddFilterDropdown called, current state:', this.isAddFilterDropdownOpen, 'availableFilters:', this.availableFilters.length);
    this.isAddFilterDropdownOpen = !this.isAddFilterDropdownOpen;
    if (this.isAddFilterDropdownOpen) {
      this.dropdownOpen = null;
    }
    console.log('New isAddFilterDropdownOpen state:', this.isAddFilterDropdownOpen);
  }

  toggleDropdown(key: string): void {
    console.log('toggleDropdown called for key:', key, 'current dropdownOpen:', this.dropdownOpen);
    this.dropdownOpen = this.dropdownOpen === key ? null : key;
    this.isAddFilterDropdownOpen = false;
    console.log('New dropdownOpen state:', this.dropdownOpen);
  }

  addFilter(key: string): void {
    console.log('addFilter called for key:', key);
    const filter = this.filterDefinitions.find(f => f.key === key);
    if (filter) {
      const relatedKey = this.getRelatedDateFilterKey(key);
      if (relatedKey) {
        this.activeFilters = this.activeFilters.filter(f => f.key !== relatedKey);
      }
      this.activeFilters.push({
        key: filter.key,
        label: filter.label,
        type: filter.type,
        isCustom: filter.isCustom || false,
        value: filter.type === 'dateRange' ? { start: null, end: null, label: null } :
               filter.type === 'number' ? { min: null, max: null } : null,
      });
      this.isAddFilterDropdownOpen = false;
      this.dropdownOpen = null;
      this.updateAvailableFilters();
      this.saveFiltersToCache();
      console.log('Filter added, activeFilters:', this.activeFilters.map(f => f.key));
    }
  }

  private getRelatedDateFilterKey(key: string): string | null {
    const pairs = {
      'deadlineInterval': 'deadlineCustom',
      'deadlineCustom': 'deadlineInterval',
      'resolvedTimeInterval': 'resolvedTimeCustom',
      'resolvedTimeCustom': 'resolvedTimeInterval',
      'creationTimeInterval': 'creationTimeCustom',
      'creationTimeCustom': 'creationTimeInterval',
      'lastModificationTimeInterval': 'lastModificationTimeCustom',
      'lastModificationTimeCustom': 'lastModificationTimeInterval',
    };
    return pairs[key] || null;
  }

  removeFilter(key: string): void {
    console.log('removeFilter called for key:', key);
    this.activeFilters = this.activeFilters.filter(f => f.key !== key);
    if (key === 'isResolved') {
      this.filters[key] = undefined;
    } else if (key.includes('Interval') || key.includes('Custom')) {
      const baseKey = key.replace('Interval', '').replace('Custom', '');
      this.filters[`${baseKey}Start`] = undefined;
      this.filters[`${baseKey}End`] = undefined;
    } else if (key === 'sum' || key === 'cancelledSum') {
      this.filters[key] = undefined;
    } else {
      this.filters[key] = undefined;
    }
    this.dropdownOpen = null;
    this.updateAvailableFilters();
    this.saveFiltersToCache();
  }

  selectOption(filter: ActiveFilter, value: any): void {
    console.log('selectOption called for filter:', filter.key, 'value:', value);
    filter.value = value;
    this.dropdownOpen = null;
    this.saveFiltersToCache();
  }

  selectInterval(filter: ActiveFilter, interval: any): void {
    console.log('selectInterval called for filter:', filter.key, 'interval:', interval);
    if (interval) {
      filter.value = {
        start: interval.start ? new Date(interval.start) : null,
        end: interval.end ? new Date(interval.end) : null,
        label: interval.label,
      };
    } else {
      filter.value = { start: null, end: null, label: null };
    }
    this.dropdownOpen = null;
    this.saveFiltersToCache();
  }

  updateDate(filter: ActiveFilter, field: 'start' | 'end', value: string): void {
    console.log('updateDate called for filter:', filter.key, 'field:', field, 'value:', value);
    if (value) {
      filter.value[field] = new Date(value);
    } else {
      filter.value[field] = null;
    }
    filter.value.label = null; // Custom intervalda label yo'q
    this.saveFiltersToCache();
  }

  applyFilters(): void {
    console.log('applyFilters called, activeFilters:', this.activeFilters);
    const newFilters = new GetAllIssuesInput();
    this.activeFilters.forEach(filter => {
      if (filter.type === 'dateRange') {
        const baseKey = filter.key.replace('Interval', '').replace('Custom', '');
        newFilters[`${baseKey}Start`] = filter.value?.start ? new Date(filter.value.start) : undefined;
        newFilters[`${baseKey}End`] = filter.value?.end ? new Date(filter.value.end) : undefined;
      } else if (filter.type === 'number') {
        newFilters[filter.key] = filter.value;
      } else if (filter.key === 'assigneeUserIds') {
        newFilters[filter.key] = filter.value ? [filter.value] : undefined; // Array sifatida yuborish
      } else {
        newFilters[filter.key] = filter.value;
      }
    });
    this.filters = newFilters;
    this.saveFiltersToCache();
    this.filtersApplied.emit(this.filters);
  }

  clearFilters(): void {
    console.log('clearFilters called');
    this.activeFilters = [];
    this.filters = new GetAllIssuesInput();
    this.dropdownOpen = null;
    this.isAddFilterDropdownOpen = false;
    this.updateAvailableFilters();
    this.saveFiltersToCache();
  }

  save(): void {
    console.log('save called');
    this.applyFilters();
    this.saveFiltersToCache();
    this.closeModal.emit();
  }

  close(): void {
    console.log('close called');
    this.saveFiltersToCache();
    this.closeModal.emit();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      console.log('Document click outside dropdown, closing all');
      this.dropdownOpen = null;
      this.isAddFilterDropdownOpen = false;
    }
  }
}