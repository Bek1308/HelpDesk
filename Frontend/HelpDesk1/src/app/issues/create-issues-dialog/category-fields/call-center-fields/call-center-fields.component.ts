import { Component, EventEmitter, Injector, Input, OnInit, Output, HostListener } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/app-component-base';
import { CreateIssuesDto, CallCenterIssueCommandDto } from '@shared/api-services/issues/model/issues-dto.model';
import { SubCategoryServiceProxy } from '@shared/api-services/sub-category/sub-category.service';
import { ServicesServiceProxy } from '@shared/api-services/services/services.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { AbpValidationSummaryComponent } from '@shared/components/validation/abp-validation.summary.component';

interface SubCategory {
  id: number;
  title: string;
}

interface Service {
  id: number;
  name: string;
}

@Component({
  selector: 'app-call-center-fields',
  templateUrl: './call-center-fields.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LocalizePipe,
    AbpValidationSummaryComponent,
  ],
})
export class CallCenterFieldsComponent extends AppComponentBase implements OnInit {
  @Input() issue: CreateIssuesDto;
  @Input() subCategories: SubCategory[] = [];
  @Input() services: Service[] = [];
  @Input() form: NgForm;
  @Output() subCategorySelected = new EventEmitter<SubCategory>();
  @Output() serviceSelected = new EventEmitter<Service>();
  filteredSubCategories: SubCategory[] = [];
  filteredServices: Service[] = [];
  isSubCategoryDropdownOpen = false;
  isServiceDropdownOpen = false;
  selectedSubCategory: SubCategory | null = null;
  selectedService: Service | null = null;
  subCategorySearch = '';
  serviceSearch = '';

  constructor(
    private injector: Injector,
    private _subCategoryService: SubCategoryServiceProxy,
    private _serviceService: ServicesServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadData();
    if (!this.issue.callCenterData) {
      this.issue.callCenterData = new CallCenterIssueCommandDto();
    }
  }

  loadData(): void {
    this.filteredSubCategories = [...this.subCategories];
    this.filteredServices = [...this.services];
    if (this.issue.callCenterData) {
      this.selectedSubCategory = this.subCategories.find(sc => sc.id === this.issue.callCenterData?.subCategoryId) || null;
      this.selectedService = this.services.find(s => s.id === this.issue.callCenterData?.serviceId) || null;
    }
  }

  toggleSubCategoryDropdown(): void {
    this.isSubCategoryDropdownOpen = !this.isSubCategoryDropdownOpen;
    if (this.isSubCategoryDropdownOpen) {
      this.isServiceDropdownOpen = false;
    }
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

  toggleServiceDropdown(): void {
    this.isServiceDropdownOpen = !this.isServiceDropdownOpen;
    if (this.isServiceDropdownOpen) {
      this.isSubCategoryDropdownOpen = false;
    }
    this.serviceSearch = '';
    this.filteredServices = [...this.services];
  }

  selectService(service: Service): void {
    this.selectedService = service;
    this.serviceSelected.emit(service);
    this.isServiceDropdownOpen = false;
    this.serviceSearch = '';
    this.filteredServices = [...this.services];
  }

  filterServices(): void {
    this.filteredServices = this.services.filter(s =>
      s.name?.toLowerCase().includes(this.serviceSearch.toLowerCase())
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
      this.isServiceDropdownOpen = false;
    }
  }
}