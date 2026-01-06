import { Component, EventEmitter, Injector, Input, OnInit, Output, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/app-component-base';
import { CreateIssuesDto } from '@shared/api-services/issues/model/issues-dto.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { AbpValidationSummaryComponent } from '@shared/components/validation/abp-validation.summary.component';

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

interface GenderOption {
  value: string;
  display: string;
}

@Component({
  selector: 'app-classic-fields',
  templateUrl: './classic-fields.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LocalizePipe,
    AbpValidationSummaryComponent,
  ],
})
export class ClassicFieldsComponent extends AppComponentBase implements OnInit, OnChanges {
  @Input() issue: CreateIssuesDto;
  @Input() form: NgForm;
  @Input() priorities: Priority[] = [];
  @Input() statuses: Status[] = [];
  @Input() users: User[] = [];
  @Input() issueId?: number;
  @Input() isEditing = false;
  @Output() prioritySelected = new EventEmitter<Priority>();
  @Output() statusSelected = new EventEmitter<Status>();
  @Output() assigneesSelected = new EventEmitter<number[]>();
  filteredPriorities: Priority[] = [];
  filteredStatuses: Status[] = [];
  filteredAssignees: User[] = [];
  isPriorityDropdownOpen = false;
  isStatusDropdownOpen = false;
  isAssigneeUsersDropdownOpen = false;
  isGenderDropdownOpen = false;
  selectedPriority: Priority | null = null;
  selectedStatus: Status | null = null;
  selectedAssignees: User[] = [];
  selectedGender: GenderOption | null = null;
  prioritySearch = '';
  statusSearch = '';
  assigneeSearch = '';
  genderSearch = '';
  genderOptions: GenderOption[] = [
    { value: 'Male', display: this.l('Male') },
    { value: 'Female', display: this.l('Female') },
    { value: 'Other', display: this.l('Other') },
  ];
  filteredGenderOptions: GenderOption[] = [];
  deadlineFormatted: string | null = null; // datetime-local inputi uchun string format

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.initializeFields();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['issue'] || changes['priorities'] || changes['statuses'] || changes['users']) {
      this.initializeFields();
    }
  }

  initializeFields(): void {
    console.log('ClassicFieldsComponent initializeFields:', {
      issue: this.issue,
      priorities: this.priorities,
      statuses: this.statuses,
      users: this.users
    });

    // Dropdown ro‘yxatlarini boshlash
    this.filteredPriorities = [...this.priorities];
    this.filteredStatuses = [...this.statuses];
    this.filteredAssignees = [...this.users];
    this.filteredGenderOptions = [...this.genderOptions];

    // Priority ni o‘rnatish
    this.selectedPriority = this.priorities.find(p => p.id === this.issue?.priorityId) || null;
    if (this.selectedPriority) {
      this.prioritySelected.emit(this.selectedPriority);
    }

    // Status ni o‘rnatish (faqat edit rejimida)
    if (this.isEditing) {
      this.selectedStatus = this.statuses.find(s => s.id === this.issue?.issueStatusId) || null;
      if (this.selectedStatus) {
        this.statusSelected.emit(this.selectedStatus);
      }
    } else {
      this.issue.issueStatusId = undefined;
      this.selectedStatus = null;
    }

    // AssigneeUsers ni o‘rnatish
    this.selectedAssignees = this.users.filter(u => this.issue?.assigneeUserIds?.includes(u.id)) || [];
    if (this.selectedAssignees.length > 0) {
      this.assigneesSelected.emit(this.issue.assigneeUserIds);
    }

    // Gender ni o‘rnatish
    this.selectedGender = this.genderOptions.find(g => g.value === this.issue?.gender) || null;
    if (!this.isEditing) {
      this.issue.clientFullName = this.issue.clientFullName || '';
      this.issue.gender = this.issue.gender || '';
    }

    // Deadline ni o‘rnatish
    if (!this.isEditing && !this.issue.deadline) {
      // Create rejimida default bugungi sana
      this.issue.deadline = new Date(); // Bugungi sana va vaqt
      this.deadlineFormatted = this.formatDateForInput(this.issue.deadline);
    } else if (this.issue.deadline) {
      // Edit rejimida bazadan olingan sana
      this.deadlineFormatted = this.formatDateForInput(this.issue.deadline);
    } else {
      this.deadlineFormatted = null;
    }
  }

  // Date ni datetime-local formatiga aylantirish (YYYY-MM-DDThh:mm)
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // datetime-local inputidan kelayotgan string ni Date ga aylantirish
  onDeadlineChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.issue.deadline = new Date(input.value);
      this.deadlineFormatted = input.value;
    } else {
      this.issue.deadline = null;
      this.deadlineFormatted = null;
    }
  }

  togglePriorityDropdown(): void {
    this.isPriorityDropdownOpen = !this.isPriorityDropdownOpen;
    if (this.isPriorityDropdownOpen) {
      this.isStatusDropdownOpen = false;
      this.isAssigneeUsersDropdownOpen = false;
      this.isGenderDropdownOpen = false;
    }
    this.prioritySearch = '';
    this.filteredPriorities = [...this.priorities];
  }

  selectPriority(priority: Priority): void {
    this.selectedPriority = priority;
    this.issue.priorityId = priority.id;
    this.prioritySelected.emit(priority);
    this.isPriorityDropdownOpen = false;
    this.prioritySearch = '';
    this.filteredPriorities = [...this.priorities];
  }

  filterPriorities(): void {
    this.filteredPriorities = this.priorities.filter(p =>
      p.title?.toLowerCase().includes(this.prioritySearch.toLowerCase() || '')
    );
  }

  toggleStatusDropdown(): void {
    if (!this.isEditing) return;
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
    if (this.isStatusDropdownOpen) {
      this.isPriorityDropdownOpen = false;
      this.isAssigneeUsersDropdownOpen = false;
      this.isGenderDropdownOpen = false;
    }
    this.statusSearch = '';
    this.filteredStatuses = [...this.statuses];
  }

  selectStatus(status: Status): void {
    if (!this.isEditing) return;
    this.selectedStatus = status;
    this.issue.issueStatusId = status.id;
    this.statusSelected.emit(status);
    this.isStatusDropdownOpen = false;
    this.statusSearch = '';
    this.filteredStatuses = [...this.statuses];
  }

  filterStatuses(): void {
    this.filteredStatuses = this.statuses.filter(s =>
      s.title?.toLowerCase().includes(this.statusSearch.toLowerCase() || '')
    );
  }

  toggleAssigneeUsersDropdown(): void {
    this.isAssigneeUsersDropdownOpen = !this.isAssigneeUsersDropdownOpen;
    if (this.isAssigneeUsersDropdownOpen) {
      this.isPriorityDropdownOpen = false;
      this.isStatusDropdownOpen = false;
      this.isGenderDropdownOpen = false;
    }
    this.assigneeSearch = '';
    this.filteredAssignees = [...this.users];
  }

  toggleGenderDropdown(): void {
    this.isGenderDropdownOpen = !this.isGenderDropdownOpen;
    if (this.isGenderDropdownOpen) {
      this.isPriorityDropdownOpen = false;
      this.isStatusDropdownOpen = false;
      this.isAssigneeUsersDropdownOpen = false;
    }
    this.genderSearch = '';
    this.filteredGenderOptions = [...this.genderOptions];
  }

  selectGender(gender: GenderOption): void {
    this.selectedGender = gender;
    this.issue.gender = gender.value;
    this.isGenderDropdownOpen = false;
    this.genderSearch = '';
    this.filteredGenderOptions = [...this.genderOptions];
  }

  filterGenders(): void {
    this.filteredGenderOptions = this.genderOptions.filter(g =>
      g.display?.toLowerCase().includes(this.genderSearch.toLowerCase() || '')
    );
  }

  toggleAssigneeSelection(user: User): void {
    const index = this.selectedAssignees.findIndex(u => u.id === user.id);
    if (index === -1) {
      this.selectedAssignees.push(user);
    } else {
      this.selectedAssignees.splice(index, 1);
    }
    this.issue.assigneeUserIds = this.selectedAssignees.map(u => u.id);
    this.assigneesSelected.emit(this.issue.assigneeUserIds);
    this.filterAssignees();
  }

  isAssigneeSelected(user: User): boolean {
    return this.selectedAssignees.some(u => u.id === user.id);
  }

  getSelectedAssigneesDisplay(): string {
    if (this.selectedAssignees.length === 0) {
      return '';
    }
    return this.selectedAssignees.map(u => u.number).join(', ');
  }

  getSelectedGenderDisplay(): string {
    return this.selectedGender?.display || this.l('SelectGender');
  }

  filterAssignees(): void {
    this.filteredAssignees = this.users.filter(u =>
      u.number?.toLowerCase().includes(this.assigneeSearch.toLowerCase() || '')
    );
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.isPriorityDropdownOpen = false;
      this.isStatusDropdownOpen = false;
      this.isAssigneeUsersDropdownOpen = false;
      this.isGenderDropdownOpen = false;
    }
  }
}