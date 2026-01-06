import { Component, Injector, OnInit, Output, EventEmitter, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/app-component-base';
import { FormsModule } from '@angular/forms';
import { AbpModalHeaderComponent } from '../../../shared/components/modal/abp-modal-header.component';
import { AbpValidationSummaryComponent } from '../../../shared/components/validation/abp-validation.summary.component';
import { AbpModalFooterComponent } from '../../../shared/components/modal/abp-modal-footer.component';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { CreateSubCategoryDto } from '@shared/api-services/sub-category/model/sub-category-dto.model';
import { SubCategoryServiceProxy } from '@shared/api-services/sub-category/sub-category.service';
import { CategoryServiceProxy } from '@shared/api-services/category/category.service';
import { CategoryDto } from '@shared/api-services/category/model/category-dto.model';
import { NgClass } from '@angular/common';
import { filter as _filter } from 'lodash-es';
import { CreateLanguagesTextDto } from '@shared/api-services/localize/model/languages-text-dto.model';
import { LanguagesTextServiceProxy } from '@shared/api-services/localize/languages-text.service';

interface LanguageOption {
  name: string;
  displayName: string;
  icon: string;
}

@Component({
    templateUrl: 'create-sub-category-dialog.component.html',
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
export class CreateSubCategoryDialogComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();
    @ViewChild('categoryInput', { static: false }) categoryInput: ElementRef;

    saving = false;
    subCategory: CreateSubCategoryDto = new CreateSubCategoryDto();
    categories: CategoryDto[] = [];
    selectedCategory: CategoryDto | null = null;
    isDropdownOpen = false;
    dropdownPosition: any = {};
    languages: LanguageOption[];
    currentLanguage: LanguageOption;
    localizedTitles: { [key: string]: string } = {};

    constructor(
        injector: Injector,
        public _subCategoryService: SubCategoryServiceProxy,
        public _categoryService: CategoryServiceProxy,
        public _languagesTextService: LanguagesTextServiceProxy,
        public bsModalRef: BsModalRef,
        private cd: ChangeDetectorRef,
        private featherIconService: FeatherIconService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.languages = _filter(this.localization.languages, (l) => !l.isDisabled).map(l => ({
            name: l.name,
            displayName: l.displayName,
            icon: l.icon
        }));
        this.currentLanguage = this.localization.currentLanguage;
        this.languages.forEach(lang => {
            this.localizedTitles[lang.name] = '';
        });
        this.localizedTitles['default'] = '';

        this._categoryService.getAll(undefined, undefined, undefined, undefined).subscribe({
            next: (result) => {
                this.categories = result.items || [];
                this.cd.detectChanges();
            },
            error: (error) => {
                this.notify.error(this.l('FailedToLoadCategories'));
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
                top: `${rect.bottom + window.scrollY + 4}px`, // 4px margin
                left: `${rect.left + window.scrollX}px`,
                width: `${rect.width + 16}px` // Input kengligidan 16px katta
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

        this.subCategory.title = this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '');

        this._subCategoryService.create(this.subCategory).subscribe(
            () => {
                const key = this.subCategory.title;
                const languageTextPromises = Object.keys(this.localizedTitles)
                    .filter(lang => lang !== 'default' && this.localizedTitles[lang] && this.localizedTitles[lang].trim() !== '')
                    .map(lang => {
                        const textDto = new CreateLanguagesTextDto();
                        textDto.init({
                            languageName: lang,
                            key: key,
                            value: this.localizedTitles[lang],
                            source: ''
                        });
                        return this._languagesTextService.create(textDto).toPromise();
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
                            this.notify.error(this.l('SaveFailed'));
                        });
                } else {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.bsModalRef.hide();
                    this.onSave.emit();
                }
            },
            () => {
                this.saving = false;
                this.notify.error(this.l('SaveFailed'));
            }
        );
    }

    hide(): void {
        this.bsModalRef.hide();
    }

    ngAfterViewInit(): void {
        this.featherIconService.replaceIcons();
    }
}


