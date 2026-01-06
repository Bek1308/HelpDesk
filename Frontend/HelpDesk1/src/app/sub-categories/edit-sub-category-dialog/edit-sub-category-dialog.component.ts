import { Component, Injector, OnInit, Output, EventEmitter, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/app-component-base';
import { FormsModule } from '@angular/forms';
import { AbpModalHeaderComponent } from '../../../shared/components/modal/abp-modal-header.component';
import { AbpValidationSummaryComponent } from '../../../shared/components/validation/abp-validation.summary.component';
import { AbpModalFooterComponent } from '../../../shared/components/modal/abp-modal-footer.component';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { NgClass } from '@angular/common';
import { SubCategoryDto } from '@shared/api-services/sub-category/model/sub-category-dto.model';
import { SubCategoryServiceProxy } from '@shared/api-services/sub-category/sub-category.service';
import { CategoryServiceProxy } from '@shared/api-services/category/category.service';
import { CategoryDto } from '@shared/api-services/category/model/category-dto.model';
import { LanguagesTextServiceProxy } from '@shared/api-services/localize/languages-text.service';
import { LanguagesTextDto, UpdateLanguagesTextDto } from '@shared/api-services/localize/model/languages-text-dto.model';
import { filter as _filter } from 'lodash-es';

interface LanguageOption {
  name: string;
  displayName: string;
  icon: string;
}

@Component({
    templateUrl: 'edit-sub-category-dialog.component.html',
    standalone: true,
    imports: [
        FormsModule,
        AbpModalHeaderComponent,
        AbpValidationSummaryComponent,
        AbpModalFooterComponent,
        LocalizePipe,
        NgClass
    ],
})
export class EditSubCategoryDialogComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();
    @ViewChild('categoryInput', { static: false }) categoryInput: ElementRef;

    saving = false;
    subCategory: SubCategoryDto = new SubCategoryDto();
    categories: CategoryDto[] = [];
    selectedCategory: CategoryDto | null = null;
    isDropdownOpen = false;
    id: number;
    dropdownPosition: any = {};
    languages: LanguageOption[] = [];
    currentLanguage: LanguageOption;
    localizedTitles: { [key: string]: string } = {};
    localizedTextIds: { [key: string]: number } = {};
    originalKey: string;

    constructor(
        injector: Injector,
        public _subCategoryService: SubCategoryServiceProxy,
        public _categoryService: CategoryServiceProxy,
        public _languagesTextService: LanguagesTextServiceProxy,
        public bsModalRef: BsModalRef,
        private cd: ChangeDetectorRef
    ) {
        super(injector);
    }

    ngOnInit(): void {
        // Initialize languages and localizedTitles
        this.languages = _filter(this.localization.languages, (l) => !l.isDisabled).map(l => ({
            name: l.name,
            displayName: l.displayName,
            icon: l.icon
        }));
        this.currentLanguage = this.localization.currentLanguage;
        this.languages.forEach(lang => {
            this.localizedTitles[lang.name] = '';
            this.localizedTextIds[lang.name] = 0;
        });
        this.localizedTitles['default'] = '';

        // Fetch categories first
        this._categoryService.getAll(undefined, undefined, undefined, undefined).subscribe({
            next: (result) => {
                this.categories = result.items || [];
                this.cd.detectChanges();
            },
            error: () => {
                this.notify.error(this.l('FailedToLoadCategories'));
                this.cd.detectChanges();
            }
        });

        // Fetch sub-category data
        this._subCategoryService.getForEdit(this.id).subscribe({
            next: (result: SubCategoryDto) => {
                this.subCategory = result;

                // Normalize title key for getByKey
                this.originalKey = this.normalizeKey(this.subCategory.title);

                this.selectedCategory = this.categories.find(c => c.id === this.subCategory.categoryId) || null;

                // Fetch localized texts using normalized key
                this._languagesTextService.getByKey(this.originalKey, '').subscribe({
                    next: (texts: LanguagesTextDto[]) => {
                        if (texts && Array.isArray(texts) && texts.length > 0) {
                            texts.forEach(text => {
                                if (text.languageName && text.value && text.id) {
                                    this.localizedTitles[text.languageName] = text.value;
                                    this.localizedTextIds[text.languageName] = text.id;
                                }
                            });
                        } else {
                            this.localizedTitles['default'] = this.subCategory.title;
                        }
                        this.cd.detectChanges();
                    },
                    error: () => {
                        this.notify.error(this.l('FailedToLoadLocalizedData'));
                        this.localizedTitles['default'] = this.subCategory.title || '';
                        this.cd.detectChanges();
                    }
                });
            },
            error: () => {
                this.notify.error(this.l('FailedToLoadSubCategory'));
                this.cd.detectChanges();
            }
        });
    }

    // Handle title input changes
    onTitleChange(value: string): void {
        this.localizedTitles[this.currentLanguage.name] = value || '';
        this.cd.detectChanges();
    }

    // Normalize key for localization
    private normalizeKey(text: string): string {
        if (!text) return '';
        return text
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
    }

    toggleDropdown(): void {
        this.isDropdownOpen = !this.isDropdownOpen;
        if (this.isDropdownOpen && this.categoryInput) {
            const rect = this.categoryInput.nativeElement.getBoundingClientRect();
            this.dropdownPosition = {
                top: `${rect.bottom + window.scrollY + 4}px`,
                left: `${rect.left + window.scrollX}px`,
                width: `${rect.width + 16}px`
            };
            this.cd.detectChanges();
        }
    }

    selectCategory(category: CategoryDto): void {
        this.subCategory.categoryId = category.id;
        this.selectedCategory = category;
        this.isDropdownOpen = false;
        this.cd.detectChanges();
    }

    save(): void {
        this.saving = true;

        // Prepare subCategory with normalized title
        const key = this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '');
        const subCategoryData = new SubCategoryDto();
        subCategoryData.init({
            ...this.subCategory,
            title: key
        });

        this._subCategoryService.update(subCategoryData).subscribe({
            next: () => {
                // Update localized texts
                const languageTextPromises = Object.keys(this.localizedTitles)
                    .filter(lang => lang !== 'default' && this.localizedTitles[lang] && this.localizedTitles[lang].trim() !== '' && this.localizedTextIds[lang] > 0)
                    .map(lang => {
                        const textDto = new UpdateLanguagesTextDto();
                        textDto.init({
                            id: this.localizedTextIds[lang],
                            value: this.localizedTitles[lang],
                            key: key
                        });
                        return this._languagesTextService.update(textDto).toPromise();
                    });

                if (languageTextPromises.length > 0) {
                    Promise.all(languageTextPromises)
                        .then(() => {
                            this.notify.info(this.l('SavedSuccessfully'));
                            this.bsModalRef.hide();
                            this.onSave.emit();
                        })
                        .catch(() => {
                            this.saving = false;
                            this.notify.error(this.l('LocalizationUpdateFailed'));
                        });
                } else {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.bsModalRef.hide();
                    this.onSave.emit();
                }
            },
            error: () => {
                this.saving = false;
                this.notify.error(this.l('SaveFailed'));
            }
        });
    }

    hide(): void {
        this.bsModalRef.hide();
    }
}
