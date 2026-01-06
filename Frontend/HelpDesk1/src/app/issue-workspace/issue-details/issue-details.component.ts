import { Component, Input, ViewChild, Injector, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/app-component-base';
import { IssuesDto, CallCenterIssueQueryDto, EditIssuesClaimsDto } from '@shared/api-services/issues/model/issues-dto.model';
import { IssuesServiceProxy } from '@shared/api-services/issues/issues.service';
import { PriorityLevelServiceProxy } from '@shared/api-services/priority-level/priority-level.service';
import { IssuesStatusesServiceProxy } from '@shared/api-services/issues-statuses/issues-statuses.service';
import { UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { SubCategoryServiceProxy } from '@shared/api-services/sub-category/sub-category.service';
import { ServicesServiceProxy } from '@shared/api-services/services/services.service';
import { FaultGroupServiceProxy } from '@shared/api-services/fault-group/fault-group.service';
import { forkJoin } from 'rxjs';

interface Priority {
  id: number;
  title: string;
}

interface Status {
  id: number;
  title: string;
}

interface User {
  id: number;
  number: string;
}

interface SubCategory {
  id: number;
  title: string;
}

interface Service {
  id: number;
  name: string;
}

interface IssueGroup {
  id: number;
  name: string;
}

@Component({
  selector: 'app-issue-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issue-details.component.html'
})
export class IssueDetailsComponent extends AppComponentBase {
  @Input() issueId: number = 2;
  @ViewChild('editIssueForm') editIssueForm: NgForm;
  Issue: IssuesDto = new IssuesDto();
  isLoading = true;
  priorities: Priority[] = [];
  statuses: Status[] = [];
  users: User[] = [];
  subCategories: SubCategory[] = [];
  services: Service[] = [];
  issueGroups: IssueGroup[] = [];
  isIssueDetailsOpen = true;
  isCallCenterDataOpen = true;
  isClaimsOpen = true;
  newClaimKey = '';
  newClaimValue = '';

  constructor(
    private injector: Injector,
    private _issuesService: IssuesServiceProxy,
    private _priorityService: PriorityLevelServiceProxy,
    private _issueStatusService: IssuesStatusesServiceProxy,
    private _userService: UserServiceProxy,
    private _subCategoryService: SubCategoryServiceProxy,
    private _serviceService: ServicesServiceProxy,
    private _issueGroupsService: FaultGroupServiceProxy,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      priorities: this._priorityService.getAll(undefined, undefined, 0, 1000),
      statuses: this._issueStatusService.getAll(undefined, undefined, 0, 1000),
      users: this._userService.getAll(undefined, true, undefined, 0, 1000),
      subCategories: this._subCategoryService.getAll(undefined, undefined, 0, 1000),
      services: this._serviceService.getAll(undefined, undefined, 0, 1000),
      issueGroups: this._issueGroupsService.getAll(undefined, 0, 1000),
    }).subscribe({
      next: ({ priorities, statuses, users, subCategories, services, issueGroups }) => {
        this.priorities = priorities.items?.map(item => ({ id: item.id, title: item.title })) || [];
        this.statuses = statuses.items?.map(item => ({ id: item.id, title: item.title })) || [];
        this.users = users.items?.map(item => ({ id: item.id, number: item.fullName })) || [];
        this.subCategories = subCategories.items?.map(item => ({ id: item.id, title: item.title })) || [];
        this.services = services.items?.map(item => ({ id: item.id, name: item.name })) || [];
        this.issueGroups = issueGroups.items?.map(item => ({ id: item.id, name: item.title })) || [];
        
        if (this.issueId) {
          this.loadIssue();
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.notify.error(this.l('FailedToLoadData'));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadIssue(): void {
    this.isLoading = true;
    this._issuesService.get(this.issueId).subscribe({
      next: (result) => {
        if (!result) {
          this.notify.error(this.l('IssueNotFound'));
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }
        this.Issue = new IssuesDto({
          id: result.id ?? 0,
          title: result.title ?? '',
          issueCategory: result.issueCategory ?? '',
          description: result.description ?? '',
          priorityId: result.priorityId ?? 0,
          priorityName: result.priorityName ?? '',
          issueStatusId: result.issueStatusId ?? 0,
          issueStatusName: result.issueStatusName ?? '',
          reportedBy: result.reportedBy ?? 0,
          reportedByName: result.reportedByName ?? '',
          deadline: result.deadline ? new Date(result.deadline) : undefined,
          resolvedTime: result.resolvedTime ? new Date(result.resolvedTime) : undefined,
          creationTime: result.creationTime ? new Date(result.creationTime) : new Date(),
          lastModificationTime: result.lastModificationTime ? new Date(result.lastModificationTime) : undefined,
          isResolved: result.isResolved ?? false,
          clientFullName: result.clientFullName ?? '',
          gender: result.gender ?? '',
          assigneeUserIds: Array.isArray(result.assigneeUserIds) ? result.assigneeUserIds : [],
          callCenterData: result.callCenterData ? new CallCenterIssueQueryDto(result.callCenterData) : undefined,
          issuesClaims: Array.isArray(result.issuesClaims) ? result.issuesClaims.map(
            (item) => new EditIssuesClaimsDto({
              id: item.id,
              claimKey: item.claimKey,
              claimValue: item.claimValue,
            })
          ) : [],
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Failed to load issue:', error);
        this.notify.error(this.l('FailedToLoadIssue'));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleAccordion(section: string): void {
    if (section === 'issue-details') {
      this.isIssueDetailsOpen = !this.isIssueDetailsOpen;
    } else if (section === 'call-center-data') {
      this.isCallCenterDataOpen = !this.isCallCenterDataOpen;
    } else if (section === 'claims') {
      this.isClaimsOpen = !this.isClaimsOpen;
    }
  }

  addClaim(): void {
    // if (this.newClaimKey && this.newClaimValue) {
    //   this.Issue.issuesClaims.push({
    //     claimKey: this.newClaimKey,
    //     claimValue: this.newClaimValue,
    //     id: this.Issue.issuesClaims.length + 1
    //   });
    //   this.newClaimKey = '';
    //   this.newClaimValue = '';
    // }
  }

  removeClaim(id: number): void {
    this.Issue.issuesClaims = this.Issue.issuesClaims.filter(claim => claim.id !== id);
  }

  getProgressBarPercentage(): number {
    const now = new Date();
    const deadline = new Date(this.Issue.deadline);
    const creation = new Date(this.Issue.creationTime);
    const totalDuration = deadline.getTime() - creation.getTime();
    const elapsed = now.getTime() - creation.getTime();
    const percentage = Math.min((elapsed / totalDuration) * 100, 100);
    return percentage > 0 ? percentage : 0;
  }

  getProgressBarColor(): string {
    const percentage = this.getProgressBarPercentage();
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Высокий': return '#ef4444';
      case 'Средний': return '#f59e0b';
      case 'Низкий': return '#22c55e';
      default: return '#6b7280';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Новая': return 'bg-blue-500';
      case 'В процессе': return 'bg-yellow-500';
      case 'Закрыта': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }
}