import { Directive, Injector, ChangeDetectorRef, TemplateRef, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Router va ActivatedRoute import qilindi
import { Observable, Subject, debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { ConfirmationService } from 'primeng/api'; // PrimeNG ConfirmationService import qilindi
import { AppComponentBase } from './app-component-base';

// Interfeyslar (o‘zgarmagan)
export interface PagedRequest {
  skipCount: number;
  maxResultCount: number;
  sorting?: string;
  keyword?: string;
  filters?: Record<string, any>;
}

export interface Column<T = any> {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  headerTemplate?: TemplateRef<any>;
  bodyTemplate?: TemplateRef<any>;
  filterTemplate?: TemplateRef<any>;
  format?: (value: any, item: T) => string;
}

export interface Filter {
  field: string;
  value: any;
  placeholder?: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'range';
  options?: { value: any; label: string }[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

@Directive()
export abstract class TableComponentBase<T> extends AppComponentBase {
  @ViewChild('sortIcon', { static: true }) sortIcon?: TemplateRef<any>;
  @ViewChild('noDataTemplate', { static: true }) noDataTemplate?: TemplateRef<any>;
  @ViewChild('loadingTemplate', { static: true }) loadingTemplate?: TemplateRef<any>;

  // Input va Output'lar
  @Input() columns: Column<T>[] = [];
  @Input() showPagination: boolean = true;
  @Input() showFilter: boolean = true;
  @Input() rowsPerPageOptions: number[] = [10, 20, 50, 100];
  @Input() maxSize: number = 7;
  @Output() onDataLoaded = new EventEmitter<PagedResult<T>>();
  @Output() onError = new EventEmitter<Error>();
  @Output() onRowClick = new EventEmitter<T>();

  // Jadval holati
  data: T[] = [];
  totalRecords: number = 0;
  keyword: string = '';
  sortField: string = '';
  sortOrder: number = 0;
  isTableLoading: boolean = false;
  pageNumber: number = 1;
  pageSize: number = 10;
  filters: Filter[] = [];
  private searchSubject = new Subject<void>();

  // Xususiyatlarni Injector orqali aniqlash
  protected activatedRoute: ActivatedRoute;
  protected router: Router;
  protected confirmationService: ConfirmationService;

  constructor(injector: Injector, protected cd: ChangeDetectorRef) {
    super(injector);
    // Injector orqali xizmatlarni olish
    this.activatedRoute = injector.get(ActivatedRoute);
    this.router = injector.get(Router);
    this.confirmationService = injector.get(ConfirmationService);
    this.setupSearchDebounce();
    this.initializeFromQueryParams();
  }

  // Search debounce sozlash
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.refresh());
  }

  // Query parametrlarni o'qish
  private initializeFromQueryParams(): void {
    const params = this.activatedRoute.snapshot.queryParams;
    this.keyword = params['keyword'] || '';
    this.pageNumber = Number(params['page']) || 1;
    this.pageSize = Number(params['pageSize']) || this.pageSize;
    this.sortField = params['sortField'] || '';
    this.sortOrder = Number(params['sortOrder']) || 0;
    this.refresh();
  }

  // Ma'lumotlarni yangilash
  refresh(): void {
    this.setLoading(true);
    const request: PagedRequest = {
      skipCount: (this.pageNumber - 1) * this.pageSize,
      maxResultCount: this.pageSize,
      sorting: this.sortField ? `${this.sortField} ${this.sortOrder === 1 ? 'ASC' : 'DESC'}` : '',
      keyword: this.keyword,
      filters: this.filters.reduce((acc, f) => ({ ...acc, [f.field]: f.value }), {}),
    };

    this.fetchData(request)
      .pipe(
        finalize(() => this.setLoading(false))
      )
      .subscribe({
        next: (result: PagedResult<T>) => {
          this.data = result.items;
          this.totalRecords = result.totalCount;
          this.onDataLoaded.emit(result);
          this.updateQueryParams();
          this.cd.markForCheck();
        },
        error: (err: Error) => {
          this.onError.emit(err);
          this.notify.error(this.l('ErrorOccurred'));
          this.setLoading(false);
        }
      });
  }

  // URL query parametrlarni yangilash
  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        keyword: this.keyword || null,
        page: this.pageNumber,
        pageSize: this.pageSize,
        sortField: this.sortField || null,
        sortOrder: this.sortOrder || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  // Saralash
  onSort(field: string): void {
    if (!this.columns.find(c => c.field === field)?.sortable) return;
    this.sortField = field;
    this.sortOrder = this.sortField === field ? (this.sortOrder === 1 ? -1 : 1) : 1;
    this.refresh();
  }

  // Filtrlash
  onFilterChange(filter: Filter): void {
    this.filters = this.filters.map(f => (f.field === filter.field ? { ...f, value: filter.value } : f));
    this.keyword = this.filters.filter(f => f.value).map(f => f.value).join(' ');
    this.searchSubject.next();
  }

  // Sahifa o'zgartirish
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.pageNumber) {
      this.pageNumber = page;
      this.refresh();
    }
  }

  // Sahifa hajmini o'zgartirish
  changePageSize(size: number): void {
    if (this.pageSize !== size) {
      this.pageSize = size;
      this.pageNumber = 1;
      this.refresh();
    }
  }

  // Elementni bosish
  onRowSelect(item: T): void {
    this.onRowClick.emit(item);
  }

  // O'chirish
  delete(item: T): void {
    this.confirmationService.confirm({
      message: this.l('AreYouSureToDelete'),
      accept: () => {
        this.setLoading(true);
        this.deleteItem(item)
          .pipe(finalize(() => this.setLoading(false)))
          .subscribe({
            next: () => {
              this.notify.success(this.l('SuccessfullyDeleted'));
              this.refresh();
            },
            error: (err: Error) => {
              this.onError.emit(err);
              this.notify.error(this.l('ErrorOccurred'));
            }
          });
      },
    });
  }

  // Umumiy sahifalar soni
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  // Ko'rsatiladigan sahifalar ro'yxati
  get pages(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.pageNumber - Math.floor(this.maxSize / 2));
    const endPage = Math.min(this.totalPages, startPage + this.maxSize - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Birinchi va oxirgi sahifa holatini tekshirish
  isFirstPage(): boolean {
    return this.pageNumber === 1;
  }

  isLastPage(): boolean {
    return this.pageNumber === this.totalPages;
  }

  // Saralash ikonkalari
  getSortIcon(field: string): string | TemplateRef<any> | undefined {
    if (this.sortField !== field || !this.columns.find(c => c.field === field)?.sortable) {
      return undefined;
    }
    return this.sortIcon || (this.sortOrder === 1 ? '↑' : '↓');
  }

  // Yuklanish holatini o'rnatish
  protected setLoading(state: boolean): void {
    this.isTableLoading = state;
    this.cd.detectChanges();
  }

  // Ma'lumot yo'qligini tekshirish
  get hasData(): boolean {
    return this.data.length > 0;
  }

  // Klaviatura navigatsiyasi uchun
  onKeyDown(event: KeyboardEvent, item: T): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.onRowSelect(item);
      event.preventDefault();
    }
  }

  // Abstrakt metodlar
  protected abstract fetchData(request: PagedRequest): Observable<PagedResult<T>>;
  protected abstract deleteItem(item: T): Observable<void>;
  protected abstract showCreateOrEditDialog(item?: T): void;
}