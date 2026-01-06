import { Component, EventEmitter, Injector, Input, OnInit, Output, HostListener } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/app-component-base';
import { CreateIssuesDto, TechDepartmentIssueCommandDto } from '@shared/api-services/issues/model/issues-dto.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { AbpValidationSummaryComponent } from '@shared/components/validation/abp-validation.summary.component';

interface User {
  id: number;
  number: string;
}

interface IssueGroup {
  id: number;
  name: string;
}

@Component({
  selector: 'app-tech-department-fields',
  templateUrl: './tech-department-fields.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LocalizePipe,
    AbpValidationSummaryComponent,
  ],
})
export class TechDepartmentFieldsComponent extends AppComponentBase implements OnInit {
  @Input() issue: CreateIssuesDto;
  @Input() users: User[] = [];
  @Input() issueGroups: IssueGroup[] = [];
  @Input() form: NgForm;
  @Output() agentSelected = new EventEmitter<User>();
  @Output() issueGroupSelected = new EventEmitter<IssueGroup>();
  filteredAgents: User[] = [];
  filteredIssueGroups: IssueGroup[] = [];
  isAgentDropdownOpen = false;
  isIssueGroupDropdownOpen = false;
  selectedAgent: User | null = null;
  selectedIssueGroup: IssueGroup | null = null;
  agentSearch = '';
  issueGroupSearch = '';

  constructor(
    injector: Injector,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadData();
    if (!this.issue.techDepartmentData) {
      this.issue.techDepartmentData = new TechDepartmentIssueCommandDto();
    }
  }

  loadData(): void {
    this.filteredAgents = [...this.users];
    this.filteredIssueGroups = [...this.issueGroups];
    if (this.issue.techDepartmentData) {
      this.selectedAgent = this.users.find(u => u.id === this.issue.techDepartmentData?.agentId) || null;
      this.selectedIssueGroup = this.issueGroups.find(ig => ig.id === this.issue.techDepartmentData?.issueGroupId) || null;
    }
  }

  toggleAgentDropdown(): void {
    this.isAgentDropdownOpen = !this.isAgentDropdownOpen;
    if (this.isAgentDropdownOpen) {
      this.isIssueGroupDropdownOpen = false;
    }
    this.agentSearch = '';
    this.filteredAgents = [...this.users];
  }

  selectAgent(user: User): void {
    this.selectedAgent = user;
    this.agentSelected.emit(user);
    this.isAgentDropdownOpen = false;
    this.agentSearch = '';
    this.filteredAgents = [...this.users];
  }

  filterAgents(): void {
    this.filteredAgents = this.users.filter(u =>
      u.number?.toLowerCase().includes(this.agentSearch.toLowerCase())
    );
  }

  toggleIssueGroupDropdown(): void {
    this.isIssueGroupDropdownOpen = !this.isIssueGroupDropdownOpen;
    if (this.isIssueGroupDropdownOpen) {
      this.isAgentDropdownOpen = false;
    }
    this.issueGroupSearch = '';
    this.filteredIssueGroups = [...this.issueGroups];
  }

  selectIssueGroup(issueGroup: IssueGroup): void {
    this.selectedIssueGroup = issueGroup;
    this.issueGroupSelected.emit(issueGroup);
    this.isIssueGroupDropdownOpen = false;
    this.issueGroupSearch = '';
    this.filteredIssueGroups = [...this.issueGroups];
  }

  filterIssueGroups(): void {
    this.filteredIssueGroups = this.issueGroups.filter(ig =>
      ig.name?.toLowerCase().includes(this.issueGroupSearch.toLowerCase())
    );
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.isAgentDropdownOpen = false;
      this.isIssueGroupDropdownOpen = false;
    }
  }
}