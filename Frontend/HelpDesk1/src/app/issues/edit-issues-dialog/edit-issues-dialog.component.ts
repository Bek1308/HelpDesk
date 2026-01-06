import { Component, Injector, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/app-component-base';
import { IssuesServiceProxy } from '@shared/api-services/issues/issues.service';
import { PriorityLevelServiceProxy } from '@shared/api-services/priority-level/priority-level.service';
import { IssuesStatusesServiceProxy } from '@shared/api-services/issues-statuses/issues-statuses.service';
import { UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { SubCategoryServiceProxy } from '@shared/api-services/sub-category/sub-category.service';
import { ServicesServiceProxy } from '@shared/api-services/services/services.service';
import { FaultGroupServiceProxy } from '@shared/api-services/fault-group/fault-group.service';
import {
  CreateIssuesDto,
  EditIssuesDto,
  EditIssuesClaimsDto,
  CreateIssuesClaimsDto,
  CallCenterIssueCommandDto,
  RepairIssueCommandDto,
  TechDepartmentIssueCommandDto,
  ATMIssueCommandDto,
  PayvandWalletIssueCommandDto,
  PayvandCardIssueCommandDto,
} from '@shared/api-services/issues/model/issues-dto.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { AbpValidationSummaryComponent } from '@shared/components/validation/abp-validation.summary.component';
import { AbpModalHeaderComponent } from '@shared/components/modal/abp-modal-header.component';
import { AbpModalFooterComponent } from '@shared/components/modal/abp-modal-footer.component';
import { ClassicFieldsComponent } from '../create-issues-dialog/category-fields/classic-fields/classic-fields.component';
import { CallCenterFieldsComponent } from '../create-issues-dialog/category-fields/call-center-fields/call-center-fields.component';
import { RepairFieldsComponent } from '../create-issues-dialog/category-fields/repair-fields/repair-fields.component';
import { TechDepartmentFieldsComponent } from '../create-issues-dialog/category-fields/tech-department-fields/tech-department-fields.component';
import { ATMFieldsComponent } from '../create-issues-dialog/category-fields/atm-fields/atm-fields.component';
import { PayvandCardFieldsComponent } from '../create-issues-dialog/category-fields/payvand-card-fields/payvand-card-fields.component';
import { PayvandWalletFieldsComponent } from '../create-issues-dialog/category-fields/payvand-wallet-fields/payvand-wallet-fields.component';
import { IssuesClaimsComponent } from '../create-issues-dialog/category-fields/issues-claims/issues-claims.component';
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
  selector: 'app-edit-issues-dialog',
  templateUrl: './edit-issues-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LocalizePipe,
    AbpValidationSummaryComponent,
    AbpModalHeaderComponent,
    AbpModalFooterComponent,
    ClassicFieldsComponent,
    CallCenterFieldsComponent,
    RepairFieldsComponent,
    TechDepartmentFieldsComponent,
    ATMFieldsComponent,
    PayvandCardFieldsComponent,
    PayvandWalletFieldsComponent,
    IssuesClaimsComponent,
  ],
})
export class EditIssuesDialogComponent extends AppComponentBase implements OnInit {
  @Input() issueId: number;
  @ViewChild('editIssueForm') editIssueForm: NgForm;
  issue: CreateIssuesDto = new CreateIssuesDto();
  saving = false;
  isLoading = true;
  saved = false;

  priorities: Priority[] = [];
  statuses: Status[] = [];
  users: User[] = [];
  subCategories: SubCategory[] = [];
  services: Service[] = [];
  issueGroups: IssueGroup[] = [];

  constructor(
    private injector: Injector,
    public bsModalRef: BsModalRef,
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
    this._issuesService.get(this.issueId).subscribe({
      next: (result) => {
        this.issue = new CreateIssuesDto({
          title: result.title,
          issueCategory: result.issueCategory,
          description: result.description,
          priorityId: result.priorityId,
          issueStatusId: result.issueStatusId,
          deadline: result.deadline ? new Date(result.deadline) : null,
          isResolved: result.isResolved,
          clientFullName: result.clientFullName,
          gender: result.gender,
          assigneeUserIds: result.assigneeUserIds?.length ? result.assigneeUserIds : [],
          callCenterData: result.callCenterData
            ? new CallCenterIssueCommandDto(result.callCenterData)
            : undefined,
          repairData: result.repairData
            ? new RepairIssueCommandDto(result.repairData)
            : undefined,
          techDepartmentData: result.techDepartmentData
            ? new TechDepartmentIssueCommandDto(result.techDepartmentData)
            : undefined,
          atmData: result.atmData
            ? new ATMIssueCommandDto(result.atmData)
            : undefined,
          payvandCardData: result.payvandCardData
            ? new PayvandCardIssueCommandDto(result.payvandCardData)
            : undefined,
          payvandWalletData: result.payvandWalletData
            ? new PayvandWalletIssueCommandDto(result.payvandWalletData)
            : undefined,
          issuesClaims: result.issuesClaims
            ? result.issuesClaims.map(item => new EditIssuesClaimsDto({
                id: item.id,
                claimKey: item.claimKey,
                claimValue: item.claimValue,
              }))
            : [],
        });
        console.log('Loaded issue:', this.issue);
        console.log('Priorities:', this.priorities);
        console.log('Statuses:', this.statuses);
        console.log('Users:', this.users);
        console.log('SubCategories:', this.subCategories);
        console.log('Services:', this.services);
        console.log('IssueGroups:', this.issueGroups);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notify.error(this.l('FailedToLoadIssue'));
        this.bsModalRef.hide();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
  

  closeAllDropdowns(): void {
    // No dropdown for category in edit mode
  }

  selectPriority(priority: Priority): void {
    this.issue.priorityId = priority.id;
    this.cdr.detectChanges();
  }

  selectStatus(status: Status): void {
    this.issue.issueStatusId = status.id;
    this.cdr.detectChanges();
  }

  updateAssignees(assigneeUserIds: number[]): void {
    this.issue.assigneeUserIds = assigneeUserIds;
    this.cdr.detectChanges();
  }

  updateClaims(claims: CreateIssuesClaimsDto[]): void {
    this.issue.issuesClaims = claims;
    console.log('Updated claims:', this.issue.issuesClaims);
    this.cdr.detectChanges();
  }

  selectSubCategory(subCategory: SubCategory): void {
    if (this.issue.callCenterData) {
      this.issue.callCenterData.subCategoryId = subCategory.id;
    } else if (this.issue.atmData) {
      this.issue.atmData.subCategoryId = subCategory.id;
    } else if (this.issue.payvandCardData) {
      this.issue.payvandCardData.subCategoryId = subCategory.id;
    } else if (this.issue.payvandWalletData) {
      this.issue.payvandWalletData.subCategoryId = subCategory.id;
    }
    this.cdr.detectChanges();
  }

  selectService(service: Service): void {
    if (this.issue.callCenterData) {
      this.issue.callCenterData.serviceId = service.id;
    } else if (this.issue.payvandWalletData) {
      this.issue.payvandWalletData.serviceId = service.id;
    }
    this.cdr.detectChanges();
  }

  selectSingleAgent(agent: User): void {
    if (this.issue.techDepartmentData) {
      this.issue.techDepartmentData.agentId = agent.id;
      this.issue.techDepartmentData.agentNumber = agent.number;
    }
    this.cdr.detectChanges();
  }

  selectIssueGroup(issueGroup: IssueGroup): void {
    if (this.issue.techDepartmentData) {
      this.issue.techDepartmentData.issueGroupId = issueGroup.id;
    }
    this.cdr.detectChanges();
  }

  isFormValid(): boolean {
    const commonFieldsValid = !!(
      this.issue.title &&
      this.issue.issueCategory &&
      this.issue.description &&
      this.issue.priorityId &&
      this.issue.assigneeUserIds?.length
    );
    const formValid = this.editIssueForm?.form.valid ?? false;
    console.log('isFormValid:', { commonFieldsValid, formValid, formErrors: this.editIssueForm?.form.errors });
    return commonFieldsValid && formValid;
  }

  save(): void {
    console.log('save() called', { formValid: this.editIssueForm.form.valid, issue: this.issue });
    if (!this.isFormValid() || !this.issueId) {
      console.log('Form is invalid, cannot save');
      this.editIssueForm.form.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }
    this.saving = true;
    const input = new EditIssuesDto({
      id: this.issueId,
      title: this.issue.title,
      issueCategory: this.issue.issueCategory,
      description: this.issue.description,
      priorityId: this.issue.priorityId,
      issueStatusId: this.issue.issueStatusId,
      deadline: this.issue.deadline,
      isResolved: this.issue.isResolved,
      resolvedTime: this.issue.isResolved ? new Date() : undefined,
      clientFullName: this.issue.clientFullName,
      gender: this.issue.gender,
      assigneeUserIds: this.issue.assigneeUserIds,
      callCenterData: this.issue.callCenterData,
      repairData: this.issue.repairData,
      techDepartmentData: this.issue.techDepartmentData,
      atmData: this.issue.atmData,
      payvandCardData: this.issue.payvandCardData,
      payvandWalletData: this.issue.payvandWalletData,
      issuesClaims: this.issue.issuesClaims?.map(item => new EditIssuesClaimsDto({
        id: item.id !== undefined ? item.id : undefined,
        claimKey: item.claimKey,
        claimValue: item.claimValue,
      })) || [],
    });
    console.log('Updating issue with input:', input);
    this._issuesService.update(input).subscribe({
      next: () => {
        this.notify.success(this.l('SuccessfullyUpdated'));
        this.saved = true;
        this.bsModalRef.hide();
      },
      error: (error) => {
        console.error('Update issue failed:', error);
        this.notify.error(this.l('FailedToUpdateIssue'));
        this.saving = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }
}