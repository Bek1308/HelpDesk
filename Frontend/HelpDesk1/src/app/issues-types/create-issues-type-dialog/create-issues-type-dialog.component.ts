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
import { IssuesTypeDto } from '@shared/api-services/issues-types/model/issues-type-dto.model';
import { IssuesTypeServiceProxy } from '@shared/api-services/issues-types/issues-type.service';
import { LanguagesTextServiceProxy } from '@shared/api-services/localize/languages-text.service';
import { CreateLanguagesTextDto } from '@shared/api-services/localize/model/languages-text-dto.model';
import { filter as _filter } from 'lodash-es';

interface LanguageOption {
  name: string;
  displayName: string;
  icon: string;
}

@Component({
  selector: 'app-create-issues-type-dialog',
  standalone: true,
  imports: [
    FormsModule,
    AbpModalHeaderComponent,
    AbpValidationSummaryComponent,
    AbpModalFooterComponent,
    LocalizePipe,
    NgClass
  ],
  templateUrl: './create-issues-type-dialog.component.html',
})
export class CreateIssuesTypeDialogComponent extends AppComponentBase implements OnInit {
  @Output() onSave = new EventEmitter<any>();
  saving = false;
  issuesType: IssuesTypeDto = new IssuesTypeDto();
  languages: LanguageOption[];
  currentLanguage: LanguageOption;
  localizedTitles: { [key: string]: string } = {};
  localizedDescriptions: { [key: string]: string } = {};

  constructor(
    injector: Injector,
    public _issuesTypeService: IssuesTypeServiceProxy,
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
      this.localizedDescriptions[lang.name] = '';
    });
    this.localizedTitles['default'] = '';
    this.localizedDescriptions['default'] = '';
    this.cd.detectChanges();
  }

  // Handle title input changes
  onTitleChange(value: string): void {
    this.localizedTitles[this.currentLanguage.name] = value || '';
    this.cd.detectChanges();
  }

  // Handle description input changes
  onDescriptionChange(value: string): void {
    this.localizedDescriptions[this.currentLanguage.name] = value || '';
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

    const issuesTypeData = new IssuesTypeDto();
    issuesTypeData.init({
      ...this.issuesType,
      title: this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || ''),
      description: this.normalizeKey(this.localizedDescriptions['en'] || this.localizedDescriptions['default'] || '')
    });

    this._issuesTypeService.create(issuesTypeData).subscribe({
      next: () => {
        const titleKey = this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '');
        const descriptionKey = this.normalizeKey(this.localizedDescriptions['en'] || this.localizedDescriptions['default'] || '');
        const languageTextPromises = [];

        // Save title localizations
        Object.keys(this.localizedTitles)
          .filter(lang => lang !== 'default' && this.localizedTitles[lang] && this.localizedTitles[lang].trim() !== '')
          .forEach(lang => {
            const textDto = new CreateLanguagesTextDto();
            textDto.init({
              languageName: lang,
              key: titleKey,
              value: this.localizedTitles[lang],
              source: ''
            });
            languageTextPromises.push(this._languagesTextService.create(textDto).toPromise());
          });

        // Save description localizations
        Object.keys(this.localizedDescriptions)
          .filter(lang => lang !== 'default' && this.localizedDescriptions[lang] && this.localizedDescriptions[lang].trim() !== '')
          .forEach(lang => {
            const textDto = new CreateLanguagesTextDto();
            textDto.init({
              languageName: lang,
              key: descriptionKey,
              value: this.localizedDescriptions[lang],
              source: ''
            });
            languageTextPromises.push(this._languagesTextService.create(textDto).toPromise());
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
              this.notify.error(this.l('LocalizationSaveFailed'));
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

  ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();
  }
}