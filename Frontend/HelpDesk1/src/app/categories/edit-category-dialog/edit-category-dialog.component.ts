import { Component, Injector, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/app-component-base';
import { FormsModule } from '@angular/forms';
import { AbpModalHeaderComponent } from '../../../shared/components/modal/abp-modal-header.component';
import { AbpValidationSummaryComponent } from '../../../shared/components/validation/abp-validation.summary.component';
import { AbpModalFooterComponent } from '../../../shared/components/modal/abp-modal-footer.component';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { NgClass } from '@angular/common';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { CategoryDto } from '@shared/api-services/category/model/category-dto.model';
import { filter as _filter } from 'lodash-es';
import { CategoryServiceProxy } from '@shared/api-services/category/category.service';
import { LanguagesTextServiceProxy } from '@shared/api-services/localize/languages-text.service';
import { LanguagesTextDto, UpdateLanguagesTextDto } from '@shared/api-services/localize/model/languages-text-dto.model';

interface LanguageOption {
  name: string;
  displayName: string;
  icon: string;
}

interface IUpdateLanguagesTextDto {
  id: number;
  value: string;
  key: string; // Added key field
}

@Component({
    templateUrl: 'edit-category-dialog.component.html',
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
export class EditCategoryDialogComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();

    saving = false;
    category: CategoryDto = new CategoryDto();
    id: number;
    isLocalized = false;
    languages: LanguageOption[];
    currentLanguage: LanguageOption;
    localizedTitles: { [key: string]: string } = {};
    localizedTextIds: { [key: string]: number } = {}; // Store IDs for localized texts
    originalKey: string;

    constructor(
        injector: Injector,
        public _categoryService: CategoryServiceProxy,
        public _languagesTextService: LanguagesTextServiceProxy,
        public bsModalRef: BsModalRef,
        private cd: ChangeDetectorRef,
        private featherIconService: FeatherIconService
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

        // Fetch category data with getForEdit
        this._categoryService.getForEdit(this.id).subscribe(
            (result: CategoryDto) => {
                this.category = result;
                this.originalKey = this.category.title; // Use non-normalized title

                // Fetch localized texts with empty source
                this._languagesTextService.getByKey(this.originalKey, '').subscribe(
                    (texts: LanguagesTextDto[]) => {
                        if (texts && Array.isArray(texts) && texts.length > 0) {
                            this.isLocalized = true;
                            texts.forEach(text => {
                                if (text.languageName && text.value && text.id) {
                                    this.localizedTitles[text.languageName] = text.value;
                                    this.localizedTextIds[text.languageName] = text.id; // Store ID for update
                                }
                            });
                        } else {
                            this.isLocalized = false;
                            this.localizedTitles['default'] = this.category.title;
                        }
                        this.cd.detectChanges();
                    },
                    (error) => {
                        this.notify.error(this.l('FailedToLoadLocalizedData'));
                        this.isLocalized = false;
                        this.localizedTitles['default'] = this.category.title || '';
                        this.cd.detectChanges();
                    }
                );
            },
            (error) => {
                this.notify.error(this.l('FailedToLoadData'));
                this.cd.detectChanges();
            }
        );
    }

    // Handle title input changes
    onTitleChange(value: string): void {
        if (this.isLocalized) {
            this.localizedTitles[this.currentLanguage.name] = value || '';
        } else {
            this.category.title = value || '';
            this.localizedTitles['default'] = value || '';
        }
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

    save(): void {
        this.saving = true;

        // Set category.title based on localization
        const categoryData = new CategoryDto();
        categoryData.init({
            ...this.category,
            title: this.isLocalized ? this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '') : this.category.title
        });

        // Save category
        this._categoryService.update(categoryData).subscribe(
            () => {
                // If localized, update localized texts only for non-empty values with valid IDs
                if (this.isLocalized) {
                    const key = this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '');
                    const languageTextPromises = Object.keys(this.localizedTitles)
                        .filter(lang => lang !== 'default' && this.localizedTitles[lang] && this.localizedTitles[lang].trim() !== '' && this.localizedTextIds[lang] > 0)
                        .map(lang => {
                            const textDto = new UpdateLanguagesTextDto();
                            textDto.init({
                                id: this.localizedTextIds[lang],
                                value: this.localizedTitles[lang],
                                key: key // Add key to UpdateLanguagesTextDto
                            });
                            return this._languagesTextService.update(textDto).toPromise();
                        });

                    // If there are localized texts to update, wait for them
                    if (languageTextPromises.length > 0) {
                        Promise.all(languageTextPromises)
                            .then(() => {
                                this.notify.info(this.l('SavedSuccessfully'));
                                this.bsModalRef.hide();
                                this.onSave.emit();
                            })
                            .catch((error) => {
                                this.notify.error(this.l('LocalizationUpdateFailed'));
                                this.saving = false;
                            });
                    } else {
                        // If no localized texts to update, complete the save
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.bsModalRef.hide();
                        this.onSave.emit();
                    }
                } else {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.bsModalRef.hide();
                    this.onSave.emit();
                }
            },
            (error) => {
                this.notify.error(this.l('SaveFailed'));
                this.saving = false;
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