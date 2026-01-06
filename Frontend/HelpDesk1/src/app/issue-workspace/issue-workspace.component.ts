import { Component, OnInit, HostListener, Input, ViewChild, Injector, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/app-component-base';
import { ATMIssueCommandDto, ATMIssueQueryDto, CallCenterIssueCommandDto, CallCenterIssueQueryDto, CreateIssuesDto, EditIssuesClaimsDto, IssuesDto, PayvandCardIssueCommandDto, PayvandCardIssueQueryDto, PayvandWalletIssueCommandDto, PayvandWalletIssueQueryDto, RepairIssueCommandDto, RepairIssueQueryDto, TechDepartmentIssueCommandDto, TechDepartmentIssueQueryDto, EditIssuesDto } from '@shared/api-services/issues/model/issues-dto.model';
import { IssuesServiceProxy } from '@shared/api-services/issues/issues.service';
import { PriorityLevelServiceProxy } from '@shared/api-services/priority-level/priority-level.service';
import { IssuesStatusesServiceProxy } from '@shared/api-services/issues-statuses/issues-statuses.service';
import { UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { SubCategoryServiceProxy } from '@shared/api-services/sub-category/sub-category.service';
import { ServicesServiceProxy } from '@shared/api-services/services/services.service';
import { FaultGroupServiceProxy } from '@shared/api-services/fault-group/fault-group.service';
import { finalize, forkJoin } from 'rxjs';
import { IssuesCommentsDto, IssuesCommentsPagedResultDto, CreateIssuesCommentsDto, UpdateIssuesCommentsDto } from '@shared/api-services/issues-comments/model/issues-comments-dto.model';
import { IssuesCommentsServiceProxy } from '@shared/api-services/issues-comments/issues-comments.service';
import { GetHistoryByIssueInput, IssuesHistoryDto, PagedResultDto } from '@shared/api-services/issues-history/model/issues-history-dto.model';
import { IssuesHistoryServiceProxy } from '@shared/api-services/issues-history/issues-history.service';
import { ActivatedRoute, Router } from '@angular/router';
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

interface HistoryStyle {
  icon: string;
  bgColor: string;
  bgColorContent: string;
}

@Component({
  selector: 'app-issue-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issue-workspace.component.html'
})
export class IssueWorkspaceComponent extends AppComponentBase implements OnInit {
  issueId: number | null = null; // Changed to nullable to handle missing ID
  @ViewChild('editIssueForm') editIssueForm: NgForm;
  Issue: IssuesDto = new IssuesDto();
  comments: IssuesCommentsDto[] = [];
  historyList: IssuesHistoryDto[] = [];
  isLoading = true;
  totalCount: number = 0;
  private _historyService: IssuesHistoryServiceProxy;

  priorities: Priority[] = [];
  statuses: Status[] = [];
  users: User[] = [];
  subCategories: SubCategory[] = [];
  services: Service[] = [];
  issueGroups: IssueGroup[] = [];
  isIssueDetailsOpen = true;
  isCallCenterDataOpen = true;
  isClaimsOpen = true;
  isCommentsOpen = true;
  newClaimKey = '';
  newClaimValue = '';
  newComment = '';
  selectedFile: File | null = null;
  editingCommentId: number | null = null;
  editingCommentFileName: string | null = null;
  dropdownOpenId: number | null = null;
  dropdownPosition: { top: number; left: number } | null = null;

  // Dropdown states
  isStatusDropdownOpen = false;
  isPriorityDropdownOpen = false;
  isAssigneeUsersDropdownOpen = false;
  statusSearch = '';
  prioritySearch = '';
  assigneeSearch = '';
  filteredStatuses: Status[] = [];
  filteredPriorities: Priority[] = [];
  filteredAssignees: User[] = [];
  selectedStatus: Status | null = null;
  selectedPriority: Priority | null = null;

  // Track changes for status and priority updates
  private originalStatusId: number | null = null;
  private originalPriorityId: number | null = null;
  private hasChanges = false;

  constructor(
    private injector: Injector,
    private _issuesService: IssuesServiceProxy,
    private _priorityService: PriorityLevelServiceProxy,
    private _issueStatusService: IssuesStatusesServiceProxy,
    private _userService: UserServiceProxy,
    private _subCategoryService: SubCategoryServiceProxy,
    private _serviceService: ServicesServiceProxy,
    private _issueGroupsService: FaultGroupServiceProxy,
    private _issueComments: IssuesCommentsServiceProxy,
    historyService: IssuesHistoryServiceProxy,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super(injector);
    this._historyService = historyService;
  }

  ngOnInit(): void {
    // Get issueId from route parameters
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.issueId = id ? +id : null;
      this.loadData();
      if (this.issueId) {
        this.loadComments();
        this.loadIssueHistory();
      }
    });
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

        this.filteredStatuses = [...this.statuses];
        this.filteredPriorities = [...this.priorities];
        this.filteredAssignees = [...this.users];

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
          repairData: result.repairData ? new RepairIssueQueryDto(result.repairData) : undefined,
          techDepartmentData: result.techDepartmentData ? new TechDepartmentIssueQueryDto(result.techDepartmentData) : undefined,
          atmData: result.atmData ? new ATMIssueQueryDto(result.atmData) : undefined,
          payvandWalletData: result.payvandWalletData ? new PayvandWalletIssueQueryDto(result.payvandWalletData) : undefined,
          payvandCardData: result.payvandCardData ? new PayvandCardIssueQueryDto(result.payvandCardData) : undefined,
          issuesClaims: Array.isArray(result.issuesClaims)
            ? result.issuesClaims.map(item => new EditIssuesClaimsDto({ id: item.id, claimKey: item.claimKey, claimValue: item.claimValue }))
            : [],
        });

        this.selectedStatus = this.statuses.find(s => s.id === this.Issue.issueStatusId) || null;
        this.selectedPriority = this.priorities.find(p => p.id === this.Issue.priorityId) || null;
        // Store original values for status and priority change detection
        this.originalStatusId = this.Issue.issueStatusId;
        this.originalPriorityId = this.Issue.priorityId;

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

  loadComments(): void {
    this.isLoading = true;
    this._issueComments.getAll(undefined, this.issueId, 'CreationTime DESC', 0, 100).subscribe({
      next: (result: IssuesCommentsPagedResultDto) => {
        this.comments = result.items || [];
        this.totalCount = result.totalCount;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading comments:', error);
        this.notify.error(this.l('FailedToLoadComments'));
      }
    });
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
          this.notify.error(this.l('FailedToLoadHistory'));
        }
      });
  }

  getIssueCategoryDisplayName(category: string): string {
    switch (category) {
      case 'CallCenter':
        return this.l('CallCenterData') || 'Данные колл-центра';
      case 'Repair':
        return this.l('RepairData') || 'Данные ремонта';
      case 'TechDepartment':
        return this.l('TechDepartmentData') || 'Данные технического отдела';
      case 'ATM':
        return this.l('ATMData') || 'Данные банкомата';
      case 'PayvandWallet':
        return this.l('PayvandWalletData') || 'Данные Payvand Wallet';
      case 'PayvandCard':
        return this.l('PayvandCardData') || 'Данные Payvand Card';
      default:
        return this.l('SpecificIssueData') || 'Данные заявки';
    }
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-button') && !target.closest('.dropdown-menu') && !target.closest('.dropdown')) {
      if (this.hasChanges) {
        this.updateIssue();
      }
      this.dropdownOpenId = null;
      this.dropdownPosition = null;
      this.isStatusDropdownOpen = false;
      this.isPriorityDropdownOpen = false;
      this.isAssigneeUsersDropdownOpen = false;
    }
  }

  updateIssue(): void {
    const editDto = new EditIssuesDto({
      id: this.Issue.id,
      title: this.Issue.title,
      issueCategory: this.Issue.issueCategory,
      description: this.Issue.description,
      priorityId: this.Issue.priorityId,
      issueStatusId: this.Issue.issueStatusId,
      deadline: this.Issue.deadline,
      isResolved: this.Issue.isResolved,
      resolvedTime: this.Issue.resolvedTime,
      clientFullName: this.Issue.clientFullName,
      gender: this.Issue.gender,
      assigneeUserIds: [...this.Issue.assigneeUserIds],
      callCenterData: this.Issue.callCenterData ? new CallCenterIssueCommandDto(this.Issue.callCenterData) : undefined,
      repairData: this.Issue.repairData ? new RepairIssueCommandDto(this.Issue.repairData) : undefined,
      techDepartmentData: this.Issue.techDepartmentData ? new TechDepartmentIssueCommandDto(this.Issue.techDepartmentData) : undefined,
      atmData: this.Issue.atmData ? new ATMIssueCommandDto(this.Issue.atmData) : undefined,
      payvandWalletData: this.Issue.payvandWalletData ? new PayvandWalletIssueCommandDto(this.Issue.payvandWalletData) : undefined,
      payvandCardData: this.Issue.payvandCardData ? new PayvandCardIssueCommandDto(this.Issue.payvandCardData) : undefined,
      issuesClaims: this.Issue.issuesClaims ? this.Issue.issuesClaims.map(item => new EditIssuesClaimsDto(item)) : [],
    });

    this.isLoading = true;
    this._issuesService.update(editDto).subscribe({
      next: () => {
        this.notify.success(this.l('IssueUpdatedSuccessfully'));
        this.originalStatusId = this.Issue.issueStatusId;
        this.originalPriorityId = this.Issue.priorityId;
        this.hasChanges = false;
        this.loadIssue(); // Reload issue to ensure UI reflects backend state
        this.loadIssueHistory(); // Reload history to reflect assignee, claim, or other changes
      },
      error: (error) => {
        console.error('Error updating issue:', error);
        this.notify.error(this.l('FailedToUpdateIssue'));
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleAccordion(section: string): void {
    if (section === 'issue-details') {
      this.isIssueDetailsOpen = !this.isIssueDetailsOpen;
    } else if (section === 'call-center-data') {
      this.isCallCenterDataOpen = !this.isCallCenterDataOpen;
    } else if (section === 'claims') {
      this.isClaimsOpen = !this.isClaimsOpen;
    } else if (section === 'comments') {
      this.isCommentsOpen = !this.isCommentsOpen;
    }
  }

  addClaim(): void {
    if (!this.newClaimKey || !this.newClaimValue) {
      this.notify.error(this.l('ClaimCannotBeEmpty'));
      return;
    }

    // Push a plain object (cast to any) to match the expected array element type
    this.Issue.issuesClaims.push({
      id: this.Issue.issuesClaims.length + 1, // Temporary ID, backend will assign actual ID
      claimKey: this.newClaimKey,
      claimValue: this.newClaimValue
    } as any);
    this.newClaimKey = '';
    this.newClaimValue = '';
    this.cdr.detectChanges();
    this.updateIssue(); // Save all claims and reload history
  }

  removeClaim(id: number): void {
    this.Issue.issuesClaims = this.Issue.issuesClaims.filter(claim => claim.id !== id);
    this.cdr.detectChanges();
    this.updateIssue(); // Save remaining claims and reload history
  }

  addComment(): void {
    if (!this.newComment) {
      this.notify.error(this.l('CommentCannotBeEmpty'));
      return;
    }

    if (this.editingCommentId !== null) {
      const comment = this.comments.find(c => c.id === this.editingCommentId);
      if (comment) {
        const updateDto = new UpdateIssuesCommentsDto({
          id: comment.id,
          issueId: this.issueId,
          content: this.newComment,
          latitude: comment.latitude,
          longitude: comment.longitude
        });

        if (this.selectedFile) {
          this._issueComments.updateCommentWithFile(comment.id, this.selectedFile).subscribe({
            next: () => {
              this._issueComments.update(updateDto).subscribe({
                next: () => {
                  this.loadComments();
                  this.resetCommentForm();
                  this.notify.success(this.l('CommentUpdatedSuccessfully'));
                  this.loadIssueHistory(); // Reload history after comment update
                },
                error: (error) => {
                  console.error('Error updating comment text:', error);
                  this.notify.error(this.l('FailedToUpdateComment'));
                }
              });
            },
            error: (error) => {
              console.error('Error updating comment file:', error);
              this.notify.error(this.l('FailedToUpdateComment'));
            }
          });
        } else {
          this._issueComments.update(updateDto).subscribe({
            next: () => {
              this.loadComments();
              this.resetCommentForm();
              this.notify.success(this.l('CommentUpdatedSuccessfully'));
              this.loadIssueHistory(); // Reload history after comment update
            },
            error: (error) => {
              console.error('Error updating comment:', error);
              this.notify.error(this.l('FailedToUpdateComment'));
            }
          });
        }
      }
    } else {
      const createDto = new CreateIssuesCommentsDto({
        issueId: this.issueId,
        content: this.newComment
      });

      this._issueComments.create(createDto).subscribe({
        next: (result) => {
          const commentId = result.id;
          if (this.selectedFile && commentId) {
            this._issueComments.createCommentWithFile(commentId, this.selectedFile).subscribe({
              next: () => {
                this.loadComments();
                this.resetCommentForm();
                this.notify.success(this.l('CommentAddedSuccessfully'));
                this.loadIssueHistory(); // Reload history after comment creation
              },
              error: (error) => {
                console.error('Error adding comment file:', error);
                this.notify.error(this.l('FailedToAddComment'));
              }
            });
          } else {
            this.loadComments();
            this.resetCommentForm();
            this.notify.success(this.l('CommentAddedSuccessfully'));
            this.loadIssueHistory(); // Reload history after comment creation
          }
        },
        error: (error) => {
          console.error('Error creating comment:', error);
          this.notify.error(this.l('FailedToAddComment'));
        }
      });
    }
  }

  editComment(id: number): void {
    const comment = this.comments.find(c => c.id === id);
    if (comment && this.canEditComment(comment)) {
      this.newComment = comment.content;
      this.editingCommentId = id;
      this.editingCommentFileName = comment.fileName;
      this.selectedFile = null;
      this.dropdownOpenId = null;
      this.cdr.detectChanges();
    } else {
      this.notify.error(this.l('CannotEditComment'));
    }
  }

  cancelEdit(): void {
    this.resetCommentForm();
  }

  deleteComment(id: number): void {
    const comment = this.comments.find(c => c.id === id);
    if (comment && this.canDeleteComment(comment)) {
      if (confirm(this.l('ConfirmDeleteComment'))) {
        this._issueComments.delete(id).subscribe({
          next: () => {
            this.loadComments();
            this.dropdownOpenId = null;
            this.notify.success(this.l('CommentDeletedSuccessfully'));
            this.loadIssueHistory(); // Reload history after comment deletion
          },
          error: (error) => {
            console.error('Error deleting comment:', error);
            this.notify.error(this.l('FailedToDeleteComment'));
          }
        });
      }
    } else {
      this.notify.error(this.l('CannotDeleteComment'));
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
    this.cdr.detectChanges();
  }

  downloadFile(comment: IssuesCommentsDto): void {
    this._issueComments.getFile(comment.id).subscribe({
      next: (file: Blob) => {
        const url = window.URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = comment.fileName || 'download';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        this.notify.error(this.l('FailedToDownloadFile'));
      }
    });
  }

  resetCommentForm(): void {
    this.newComment = '';
    this.selectedFile = null;
    this.editingCommentId = null;
    this.editingCommentFileName = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    this.cdr.detectChanges();
  }

  canEditComment(comment: IssuesCommentsDto): boolean {
    return comment.creatorUserId === this.appSession.userId;
  }

  canDeleteComment(comment: IssuesCommentsDto): boolean {
    return comment.creatorUserId === this.appSession.userId;
  }

  getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? 'image' : 'text';
  }

  toggleDropdown(id: number, event: Event): void {
    if (this.dropdownOpenId === id) {
      this.dropdownOpenId = null;
      this.dropdownPosition = null;
    } else {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.dropdownOpenId = id;
      this.dropdownPosition = {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 120
      };
    }
  }

  toggleStatusDropdown(): void {
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
    if (!this.isStatusDropdownOpen && this.hasChanges) {
      this.updateIssue();
    }
    this.isPriorityDropdownOpen = false;
    this.isAssigneeUsersDropdownOpen = false;
    this.statusSearch = '';
    this.filterStatuses();
  }

  togglePriorityDropdown(): void {
    this.isPriorityDropdownOpen = !this.isPriorityDropdownOpen;
    if (!this.isPriorityDropdownOpen && this.hasChanges) {
      this.updateIssue();
    }
    this.isStatusDropdownOpen = false;
    this.isAssigneeUsersDropdownOpen = false;
    this.prioritySearch = '';
    this.filterPriorities();
  }

  toggleAssigneeUsersDropdown(): void {
    this.isAssigneeUsersDropdownOpen = !this.isAssigneeUsersDropdownOpen;
    this.isStatusDropdownOpen = false;
    this.isPriorityDropdownOpen = false;
    this.assigneeSearch = '';
    this.filterAssignees();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  filterStatuses(): void {
    this.filteredStatuses = this.statuses.filter(status =>
      status.title.toLowerCase().includes(this.statusSearch.toLowerCase())
    );
  }

  filterPriorities(): void {
    this.filteredPriorities = this.priorities.filter(priority =>
      priority.title.toLowerCase().includes(this.prioritySearch.toLowerCase())
    );
  }

  filterAssignees(): void {
    this.filteredAssignees = this.users.filter(user =>
      user.number.toLowerCase().includes(this.assigneeSearch.toLowerCase())
    );
  }

  selectStatus(status: Status): void {
    if (this.Issue.issueStatusId !== status.id) {
      this.hasChanges = true;
    }
    this.selectedStatus = status;
    this.Issue.issueStatusId = status.id;
    this.Issue.issueStatusName = status.title;
    this.isStatusDropdownOpen = false;
    this.updateIssue(); // Update immediately after selection
  }

  selectPriority(priority: Priority): void {
    if (this.Issue.priorityId !== priority.id) {
      this.hasChanges = true;
    }
    this.selectedPriority = priority;
    this.Issue.priorityId = priority.id;
    this.Issue.priorityName = priority.title;
    this.isPriorityDropdownOpen = false;
    this.updateIssue(); // Update immediately after selection
  }

  toggleAssigneeSelection(user: User): void {
    const index = this.Issue.assigneeUserIds.indexOf(user.id);
    if (index === -1) {
      this.Issue.assigneeUserIds.push(user.id);
    } else {
      this.Issue.assigneeUserIds.splice(index, 1);
    }
    this.cdr.detectChanges();
    this.updateIssue(); // Update immediately after assignee change
  }

  isAssigneeSelected(user: User): boolean {
    return this.Issue.assigneeUserIds.includes(user.id);
  }

  getSelectedAssigneesDisplay(): string {
    if (!this.Issue.assigneeUserIds.length) {
      return '';
    }
    return this.Issue.assigneeUserIds
      .map(id => this.users.find(u => u.id === id)?.number || '')
      .filter(name => name)
      .join(', ');
  }

  getProgressBarPercentage(): number {
    const now = new Date();
    const deadline = new Date(this.Issue.deadline);
    const creation = new Date(this.Issue.creationTime);
    const totalDuration = deadline.getTime() - creation.getTime();
    const elapsed = now.getTime() - creation.getTime();
    return totalDuration > 0 ? Math.min((elapsed / totalDuration) * 100, 100) : 0;
  }

  getProgressBarColor(): string {
    const percentage = this.getProgressBarPercentage();
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getRandomIconAndColor(id: number): HistoryStyle {
    const icons = ['check', 'edit', 'time', 'user', 'plus'];
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500'
    ];
    const contentColors = [
      'bg-blue-100 dark:bg-blue-900',
      'bg-green-100 dark:bg-green-900',
      'bg-yellow-100 dark:bg-yellow-900',
      'bg-red-100 dark:bg-red-900',
      'bg-purple-100 dark:bg-purple-900'
    ];
    const index = id % icons.length;
    return {
      icon: icons[index],
      bgColor: colors[index],
      bgColorContent: contentColors[index]
    };
  }
  
  closeIssue(): void {
    this.router.navigate(['/issues']);
  }
}