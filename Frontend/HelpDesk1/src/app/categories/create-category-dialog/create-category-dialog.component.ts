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
import { CreateCategoryDto } from '@shared/api-services/category/model/category-dto.model';
import { filter as _filter } from 'lodash-es';
import { CategoryServiceProxy } from '@shared/api-services/category/category.service';
import { CreateLanguagesTextDto } from '@shared/api-services/localize/model/languages-text-dto.model';
import { LanguagesTextServiceProxy } from '@shared/api-services/localize/languages-text.service';

interface LanguageOption {
  name: string;
  displayName: string;
  icon: string;
}

interface ICreateLanguagesTextDto {
  languageName: string;
  key: string;
  value: string;
  source: string;
}

@Component({
    templateUrl: 'create-category-dialog.component.html',
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
export class CreateCategoryDialogComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();

    saving = false;
    category: CreateCategoryDto = new CreateCategoryDto();
    languages: LanguageOption[];
    currentLanguage: LanguageOption;
    localizedTitles: { [key: string]: string } = {};

    constructor(
        injector: Injector,
        public _categoryService: CategoryServiceProxy,
        public _languagesTextService: LanguagesTextServiceProxy,
        public bsModalRef: BsModalRef,
        private cd: ChangeDetectorRef,
        private featherIconService: FeatherIconService
    ) {
        super(injector);
        // Initialize category with default values
        this.category.title = '';
        this.category.distance = 0;
        this.category.score = 0;
        this.category.price = 0;
    }

    ngOnInit(): void {
        // Initialize languages and localizedTitles
        this.languages = _filter(this.localization.languages, (l) => !l.isDisabled).map(l => ({
            name: l.name,
            displayName: l.displayName,
            icon: l.icon
        }));
        this.currentLanguage = this.localization.currentLanguage;
        // Initialize localizedTitles for each language with empty strings
        this.languages.forEach(lang => {
            this.localizedTitles[lang.name] = '';
        });
        this.localizedTitles['default'] = '';
        this.cd.detectChanges();
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

    save(): void {
        this.saving = true;

        // Set category.title based on localization
        const categoryData = new CreateCategoryDto();
        categoryData.init({
            ...this.category,
            title: this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '')
        });

        // Save category
        this._categoryService.create(categoryData).subscribe(
            () => {
                // Save localized texts for non-empty values
                const key = this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '');
                const languageTextPromises = Object.keys(this.localizedTitles)
                    .filter(lang => lang !== 'default' && this.localizedTitles[lang] && this.localizedTitles[lang].trim() !== '')
                    .map(lang => {
                        const textDto = new CreateLanguagesTextDto();
                        textDto.init({
                            languageName: lang,
                            key: key,
                            value: this.localizedTitles[lang],
                            source: '' // Empty source, backend sets default
                        });
                        return this._languagesTextService.create(textDto).toPromise();
                    });

                // If there are localized texts to save, wait for them
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
                    // If no localized texts, complete the save
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