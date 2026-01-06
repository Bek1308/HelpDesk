import { Component, EventEmitter, Injector, Input, OnInit, Output, HostListener } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/app-component-base';
import { CreateIssuesDto, ATMIssueCommandDto } from '@shared/api-services/issues/model/issues-dto.model';
import { SubCategoryServiceProxy } from '@shared/api-services/sub-category/sub-category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { AbpValidationSummaryComponent } from '@shared/components/validation/abp-validation.summary.component';

interface SubCategory {
  id: number;
  title: string;
}

@Component({
  selector: 'app-atm-fields',
  templateUrl: './atm-fields.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LocalizePipe,
    AbpValidationSummaryComponent,
  ],
})
export class ATMFieldsComponent extends AppComponentBase implements OnInit {
  @Input() issue: CreateIssuesDto;
  @Input() subCategories: SubCategory[] = [];
  @Input() form: NgForm;
  @Output() subCategorySelected = new EventEmitter<SubCategory>();
  filteredSubCategories: SubCategory[] = [];
  isSubCategoryDropdownOpen = false;
  selectedSubCategory: SubCategory | null = null;
  subCategorySearch = '';

  constructor(
    private injector: Injector,
    private _subCategoryService: SubCategoryServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadData();
    if (!this.issue.atmData) {
      this.issue.atmData = new ATMIssueCommandDto();
    }
  }

  loadData(): void {
    this.filteredSubCategories = [...this.subCategories];
    if (this.issue.atmData) {
      this.selectedSubCategory = this.subCategories.find(sc => sc.id === this.issue.atmData?.subCategoryId) || null;
    }
  }

  toggleSubCategoryDropdown(): void {
    this.isSubCategoryDropdownOpen = !this.isSubCategoryDropdownOpen;
    this.subCategorySearch = '';
    this.filteredSubCategories = [...this.subCategories];
  }

  selectSubCategory(subCategory: SubCategory): void {
    this.selectedSubCategory = subCategory;
    this.subCategorySelected.emit(subCategory);
    this.isSubCategoryDropdownOpen = false;
    this.subCategorySearch = '';
    this.filteredSubCategories = [...this.subCategories];
  }

  filterSubCategories(): void {
    this.filteredSubCategories = this.subCategories.filter(sc =>
      sc.title?.toLowerCase().includes(this.subCategorySearch.toLowerCase())
    );
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.isSubCategoryDropdownOpen = false;
    }
  }
}