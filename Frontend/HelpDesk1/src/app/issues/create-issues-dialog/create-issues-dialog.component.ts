import { Component, Injector, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
  CallCenterIssueCommandDto,
  RepairIssueCommandDto,
  TechDepartmentIssueCommandDto,
  ATMIssueCommandDto,
  PayvandWalletIssueCommandDto,
  PayvandCardIssueCommandDto,
  CreateIssuesClaimsDto,
} from '@shared/api-services/issues/model/issues-dto.model';
import { IssueCategoriesResponse, IssueCategory } from '@shared/api-services/issues/model/issue-categories.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { AbpValidationSummaryComponent } from '@shared/components/validation/abp-validation.summary.component';
import { AbpModalHeaderComponent } from '@shared/components/modal/abp-modal-header.component';
import { AbpModalFooterComponent } from '@shared/components/modal/abp-modal-footer.component';
import { ClassicFieldsComponent } from './category-fields/classic-fields/classic-fields.component';
import { CallCenterFieldsComponent } from './category-fields/call-center-fields/call-center-fields.component';
import { RepairFieldsComponent } from './category-fields/repair-fields/repair-fields.component';
import { TechDepartmentFieldsComponent } from './category-fields/tech-department-fields/tech-department-fields.component';
import { ATMFieldsComponent } from './category-fields/atm-fields/atm-fields.component';
import { PayvandCardFieldsComponent } from './category-fields/payvand-card-fields/payvand-card-fields.component';
import { PayvandWalletFieldsComponent } from './category-fields/payvand-wallet-fields/payvand-wallet-fields.component';
import { IssuesClaimsComponent } from './category-fields/issues-claims/issues-claims.component';
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
  selector: 'app-create-issues-dialog',
  templateUrl: './create-issues-dialog.component.html',
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
export class CreateIssuesDialogComponent extends AppComponentBase implements OnInit {
  @ViewChild('createIssueForm') createIssueForm: NgForm;
  issue: CreateIssuesDto = new CreateIssuesDto();
  saving = false;
  isLoading = true;
  saved = false;
  categories: IssueCategory[] = [{ category: 'Classic', displayName: this.l('Classic') }]; // Initialize with Classic
  selectedCategory: string | null = null;
  priorities: Priority[] = [];
  statuses: Status[] = [];
  users: User[] = [];
  subCategories: SubCategory[] = [];
  services: Service[] = [];
  issueGroups: IssueGroup[] = [];
  isCategoryDropdownOpen = false;

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

  getCategoryDisplayName(category: string | undefined): string {
    if (!category) {
      return this.l('SelectCategory');
    }
    const foundCategory = this.categories.find(c => c.category === category);
    return foundCategory ? foundCategory.displayName : this.l('SelectCategory');
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
      categories: this._issuesService.getIssueCategories(),
    }).subscribe({
      next: ({ priorities, statuses, users, subCategories, services, issueGroups, categories }) => {
        this.priorities = priorities.items?.map(item => ({ id: item.id, title: item.title })) || [];
        this.statuses = statuses.items?.map(item => ({ id: item.id, title: item.title })) || [];
        this.users = users.items?.map(item => ({ id: item.id, number: item.fullName })) || [];
        this.subCategories = subCategories.items?.map(item => ({ id: item.id, title: item.title })) || [];
        this.services = services.items?.map(item => ({ id: item.id, name: item.name })) || [];
        this.issueGroups = issueGroups.items?.map(item => ({ id: item.id, name: item.title })) || [];
        this.categories = [
          { category: 'Classic', displayName: this.l('Classic') },
          ...categories.categories,
        ];
        this.issue = new CreateIssuesDto();
        this.issue.isResolved = false;
        this.issue.assigneeUserIds = [];
        this.issue.issuesClaims = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notify.error(this.l('FailedToLoadData'));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  closeAllDropdowns(): void {
    this.isCategoryDropdownOpen = false;
  }

  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
    if (this.isCategoryDropdownOpen) {
      this.closeAllDropdowns();
      this.isCategoryDropdownOpen = true;
    }
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.issue.issueCategory = category;
    this.isCategoryDropdownOpen = false;
    this.resetCategorySpecificFields();
    this.cdr.detectChanges();
  }

  resetCategorySpecificFields(): void {
    this.issue.callCenterData = undefined;
    this.issue.repairData = undefined;
    this.issue.techDepartmentData = undefined;
    this.issue.atmData = undefined;
    this.issue.payvandWalletData = undefined;
    this.issue.payvandCardData = undefined;

    if (this.selectedCategory === 'CallCenter') {
      this.issue.callCenterData = new CallCenterIssueCommandDto();
    } else if (this.selectedCategory === 'Repair') {
      this.issue.repairData = new RepairIssueCommandDto();
    } else if (this.selectedCategory === 'TechDepartment') {
      this.issue.techDepartmentData = new TechDepartmentIssueCommandDto();
    } else if (this.selectedCategory === 'AtmIssues') {
      this.issue.atmData = new ATMIssueCommandDto();
    } else if (this.selectedCategory === 'PayvandWallet') {
      this.issue.payvandWalletData = new PayvandWalletIssueCommandDto();
    } else if (this.selectedCategory === 'PayvandCard') {
      this.issue.payvandCardData = new PayvandCardIssueCommandDto();
    }
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  selectSubCategory(subCategory: SubCategory): void {
    if (this.selectedCategory === 'CallCenter' && this.issue.callCenterData) {
      this.issue.callCenterData.subCategoryId = subCategory.id;
    } else if (this.selectedCategory === 'AtmIssues' && this.issue.atmData) {
      this.issue.atmData.subCategoryId = subCategory.id;
    } else if (this.selectedCategory === 'PayvandWallet' && this.issue.payvandWalletData) {
      this.issue.payvandWalletData.subCategoryId = subCategory.id;
    } else if (this.selectedCategory === 'PayvandCard' && this.issue.payvandCardData) {
      this.issue.payvandCardData.subCategoryId = subCategory.id;
    }
    this.cdr.detectChanges();
  }

  selectService(service: Service): void {
    if (this.selectedCategory === 'CallCenter' && this.issue.callCenterData) {
      this.issue.callCenterData.serviceId = service.id;
    } else if (this.selectedCategory === 'PayvandWallet' && this.issue.payvandWalletData) {
      this.issue.payvandWalletData.serviceId = service.id;
    }
    this.cdr.detectChanges();
  }

  selectSingleAgent(agent: User): void {
    if (this.selectedCategory === 'TechDepartment' && this.issue.techDepartmentData) {
      this.issue.techDepartmentData.agentId = agent.id;
      this.issue.techDepartmentData.agentNumber = agent.number;
    }
    this.cdr.detectChanges();
  }

  selectIssueGroup(issueGroup: IssueGroup): void {
    if (this.selectedCategory === 'TechDepartment' && this.issue.techDepartmentData) {
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
      this.issue.assigneeUserIds.length
    );
    const formValid = this.createIssueForm?.form.valid ?? false;
    console.log('isFormValid:', { commonFieldsValid, formValid, formErrors: this.createIssueForm?.form.errors });
    return commonFieldsValid && formValid;
  }

  save(): void {
    if (!this.isFormValid()) {
      this.createIssueForm.form.markAllAsTouched();
      this.cdr.detectChanges();
      console.log('FORM IS NOT VALID')
      return;
    }
    this.saving = true;
    const input = new CreateIssuesDto({
      title: this.issue.title,
      issueCategory: this.issue.issueCategory,
      description: this.issue.description,
      priorityId: this.issue.priorityId,
      issueStatusId: this.issue.issueStatusId,
      deadline: this.issue.deadline ? new Date(this.issue.deadline) : undefined,
      isResolved: this.issue.isResolved,
      clientFullName: this.issue.clientFullName,
      gender: this.issue.gender,
      assigneeUserIds: this.issue.assigneeUserIds,
      callCenterData: this.issue.callCenterData,
      repairData: this.issue.repairData,
      techDepartmentData: this.issue.techDepartmentData,
      atmData: this.issue.atmData,
      payvandWalletData: this.issue.payvandWalletData,
      payvandCardData: this.issue.payvandCardData,
      issuesClaims: this.issue.issuesClaims || [],
    });
    this._issuesService.create(input).subscribe({
      next: () => {
        this.notify.success(this.l('SuccessfullyCreated'));
        this.saved = true;
        this.bsModalRef.hide();
      },
      error: (error) => {
        console.error('Create issue failed:', error);
        this.notify.error(this.l('FailedToCreateIssue'));
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