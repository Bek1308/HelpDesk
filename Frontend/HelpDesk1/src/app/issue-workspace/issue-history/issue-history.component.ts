import { Component, Input, Injector, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { AppComponentBase } from '../../../shared/app-component-base';
import { GetHistoryByIssueInput, IssuesHistoryDto, PagedResultDto } from '../../../shared/api-services/issues-history/model/issues-history-dto.model';
import { IssuesHistoryServiceProxy } from '../../../shared/api-services/issues-history/issues-history.service';

@Component({
  selector: 'app-issue-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issue-history.component.html'
})
export class IssueHistoryComponent extends AppComponentBase {
  @Input() issueId: number = 2;
  historyList: IssuesHistoryDto[] = [];
  isLoading = true;
  totalCount: number = 0;

  constructor(
    private injector: Injector,
    private _historyService: IssuesHistoryServiceProxy,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadIssueHistory();
  }

  loadIssueHistory(skipCount: number = 0, maxResultCount: number = 100, sorting: string = 'creationTime desc'): void {
    this.isLoading = true;
    const input = new GetHistoryByIssueInput({
      issueId: this.issueId,
      skipCount,
      maxResultCount,
      sorting
    });
    this._historyService.getHistoryByIssueId(input)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (result) => {
          const paged = PagedResultDto.fromJS<IssuesHistoryDto>(result, IssuesHistoryDto.fromJS);
          this.historyList = paged.items ?? [];
          this.totalCount = paged.totalCount ?? 0;
        },
        error: () => {
          console.error('Failed to load issue history');
        }
      });
  }

  getRandomIconAndColor(): { icon: string; bgColor: string; textColor: string } {
    const options = [
      { icon: 'check', bgColor: 'bg-primary-500 dark:bg-primary-300', textColor: 'text-white' },
      { icon: 'edit', bgColor: 'bg-green-500 dark:bg-green-300', textColor: 'text-white' },
      { icon: 'time', bgColor: 'bg-yellow-500 dark:bg-yellow-300', textColor: 'text-white' }
    ];
    const index = Math.floor(Math.random() * options.length);
    return options[index];
  }
}