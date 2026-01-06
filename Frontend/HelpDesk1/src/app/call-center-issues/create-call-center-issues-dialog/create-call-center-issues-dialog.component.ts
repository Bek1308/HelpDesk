// import { Component, Injector, OnInit, Output, EventEmitter, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
// import { BsModalRef } from 'ngx-bootstrap/modal';
// import { AppComponentBase } from '@shared/app-component-base';
// import { FormsModule } from '@angular/forms';
// import { AbpModalHeaderComponent } from '../../../shared/components/modal/abp-modal-header.component';
// import { AbpValidationSummaryComponent } from '../../../shared/components/validation/abp-validation.summary.component';
// import { AbpModalFooterComponent } from '../../../shared/components/modal/abp-modal-footer.component';
// import { LocalizePipe } from '@shared/pipes/localize.pipe';
// import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
// import { CreateCallCenterIssuesDto } from '@shared/api-services/call-center-issues/model/call-center-issues-dto.model';
// import { CallCenterIssuesServiceProxy } from '@shared/api-services/call-center-issues/call-center-issues.service';
// import { SubCategoryServiceProxy } from '@shared/api-services/sub-category/sub-category.service';
// import { SubCategoryDto } from '@shared/api-services/sub-category/model/sub-category-dto.model';
// import { ServiceDto } from '@shared/api-services/services/model/service-dto.model';
// import { ServicesServiceProxy } from '@shared/api-services/services/services.service';
// import { IssuesStatusesDto } from '@shared/api-services/issues-statuses/model/issues-statuses-dto.model';
// import { IssuesStatusesServiceProxy } from '@shared/api-services/issues-statuses/issues-statuses.service';

// @Component({
//   selector: 'app-create-call-center-issues-dialog',
//   imports: [
//     FormsModule,
//     AbpModalHeaderComponent,
//     AbpValidationSummaryComponent,
//     AbpModalFooterComponent,
//     LocalizePipe
//   ],
//   templateUrl: './create-call-center-issues-dialog.component.html',
//   standalone: true
// })
// export class CreateCallCenterIssuesDialogComponent extends AppComponentBase implements OnInit {
//   @Output() onSave = new EventEmitter<any>();
//   @ViewChild('subCategoryInput', { static: false }) subCategoryInput: ElementRef;
//   @ViewChild('serviceInput', { static: false }) serviceInput: ElementRef;
//   @ViewChild('statusInput', { static: false }) statusInput: ElementRef;

//   saving = false;
//   callCenterIssue: CreateCallCenterIssuesDto = new CreateCallCenterIssuesDto();
//   subCategories: SubCategoryDto[] = [];
//   services: ServiceDto[] = [];
//   statuses: IssuesStatusesDto[] = [];
//   selectedSubCategory: SubCategoryDto | null = null;
//   selectedService: ServiceDto | null = null;
//   selectedStatus: IssuesStatusesDto | null = null;
//   isSubCategoryDropdownOpen = false;
//   isServiceDropdownOpen = false;
//   isStatusDropdownOpen = false;
//   subCategoryDropdownPosition: any = {};
//   serviceDropdownPosition: any = {};
//   statusDropdownPosition: any = {};

//   constructor(
//     injector: Injector,
//     public _callCenterIssuesService: CallCenterIssuesServiceProxy,
//     public _subCategoryService: SubCategoryServiceProxy,
//     public _serviceService: ServicesServiceProxy,
//     public _statusService: IssuesStatusesServiceProxy,
//     public bsModalRef: BsModalRef,
//     private cd: ChangeDetectorRef,
//     private featherIconService: FeatherIconService
//   ) {
//     super(injector);
//   }

//   ngOnInit(): void {
//     // Fetch subCategories
//     this._subCategoryService.getAll(undefined, undefined, undefined, undefined).subscribe({
//       next: (result) => {
//         this.subCategories = result.items || [];
//         this.cd.detectChanges();
//       },
//       error: (error) => {
//         console.error('Failed to load subCategories:', error);
//         this.notify.error(this.l('FailedToLoadSubCategories'));
//       }
//     });

//     // Fetch services
//     this._serviceService.getAll(undefined, undefined, undefined, undefined).subscribe({
//       next: (result) => {
//         this.services = result.items || [];
//         this.cd.detectChanges();
//       },
//       error: (error) => {
//         console.error('Failed to load services:', error);
//         this.notify.error(this.l('FailedToLoadServices'));
//       }
//     });

//     // Fetch statuses
//     this._statusService.getAll(undefined, undefined, undefined, undefined).subscribe({
//       next: (result) => {
//         this.statuses = result.items || [];
//         this.cd.detectChanges();
//       },
//       error: (error) => {
//         console.error('Failed to load statuses:', error);
//         this.notify.error(this.l('FailedToLoadStatuses'));
//       }
//     });
//   }

//   toggleSubCategoryDropdown(): void {
//     this.isSubCategoryDropdownOpen = !this.isSubCategoryDropdownOpen;
//     if (this.isSubCategoryDropdownOpen && this.subCategoryInput) {
//       const rect = this.subCategoryInput.nativeElement.getBoundingClientRect();
//       this.subCategoryDropdownPosition = {
//         top: `${rect.bottom + window.scrollY + 4}px`,
//         left: `${rect.left + window.scrollX}px`,
//         width: `${rect.width + 16}px`
//       };
//       this.cd.detectChanges();
//     }
//   }

//   toggleServiceDropdown(): void {
//     this.isServiceDropdownOpen = !this.isServiceDropdownOpen;
//     if (this.isServiceDropdownOpen && this.serviceInput) {
//       const rect = this.serviceInput.nativeElement.getBoundingClientRect();
//       this.serviceDropdownPosition = {
//         top: `${rect.bottom + window.scrollY + 4}px`,
//         left: `${rect.left + window.scrollX}px`,
//         width: `${rect.width + 16}px`
//       };
//       this.cd.detectChanges();
//     }
//   }

//   toggleStatusDropdown(): void {
//     this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
//     if (this.isStatusDropdownOpen && this.statusInput) {
//       const rect = this.statusInput.nativeElement.getBoundingClientRect();
//       this.statusDropdownPosition = {
//         top: `${rect.bottom + window.scrollY + 4}px`,
//         left: `${rect.left + window.scrollX}px`,
//         width: `${rect.width + 16}px`
//       };
//       this.cd.detectChanges();
//     }
//   }

//   selectSubCategory(subCategory: SubCategoryDto): void {
//     this.callCenterIssue.subCategoryId = subCategory.id;
//     this.selectedSubCategory = subCategory;
//     this.isSubCategoryDropdownOpen = false;
//     this.cd.detectChanges();
//   }

//   selectService(service: ServiceDto): void {
//     this.callCenterIssue.serviceId = service.id;
//     this.selectedService = service;
//     this.isServiceDropdownOpen = false;
//     this.cd.detectChanges();
//   }

//   selectStatus(status: IssuesStatusesDto): void {
//     this.callCenterIssue.statusId = status.id;
//     this.selectedStatus = status;
//     this.isStatusDropdownOpen = false;
//     this.cd.detectChanges();
//   }

//   save(): void {
//     this.saving = true;
//     this._callCenterIssuesService.create(this.callCenterIssue).subscribe({
//       next: () => {
//         this.notify.info(this.l('SavedSuccessfully'));
//         this.bsModalRef.hide();
//         this.onSave.emit();
//         this.saving = false;
//       },
//       error: () => {
//         this.saving = false;
//         this.notify.error(this.l('FailedToSave'));
//       }
//     });
//   }

//   hide(): void {
//     this.bsModalRef.hide();
//   }

//   ngAfterViewInit(): void {
//     this.featherIconService.replaceIcons();
//   }
// }