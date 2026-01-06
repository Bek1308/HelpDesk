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
import { LanguagesTextDto, UpdateLanguagesTextDto } from '@shared/api-services/localize/model/languages-text-dto.model';
import { filter as _filter } from 'lodash-es';

interface LanguageOption {
  name: string;
  displayName: string;
  icon: string;
}

interface IUpdateLanguagesTextDto {
  id: number;
  value: string;
  key: string;
}

@Component({
  selector: 'app-edit-issues-type-dialog',
  standalone: true,
  imports: [
    FormsModule,
    AbpModalHeaderComponent,
    AbpValidationSummaryComponent,
    AbpModalFooterComponent,
    LocalizePipe,
    NgClass
  ],
  templateUrl: './edit-issues-type-dialog.component.html',
})
export class EditIssuesTypeDialogComponent extends AppComponentBase implements OnInit {
  @Output() onSave = new EventEmitter<any>();
  saving = false;
  issuesType: IssuesTypeDto = new IssuesTypeDto();
  id: number;
  languages: LanguageOption[];
  currentLanguage: LanguageOption;
  localizedTitles: { [key: string]: string } = {};
  localizedDescriptions: { [key: string]: string } = {};
  localizedTitleIds: { [key: string]: number } = {};
  localizedDescriptionIds: { [key: string]: number } = {};
  originalTitleKey: string;
  originalDescriptionKey: string;

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
      this.localizedTitleIds[lang.name] = 0;
      this.localizedDescriptionIds[lang.name] = 0;
    });
    this.localizedTitles['default'] = '';
    this.localizedDescriptions['default'] = '';

    this._issuesTypeService.getForEdit(this.id).subscribe({
      next: (result: IssuesTypeDto) => {
        this.issuesType = result;
        this.originalTitleKey = this.issuesType.title;
        this.originalDescriptionKey = this.issuesType.description || '';

        // Fetch title localizations
        this._languagesTextService.getByKey(this.originalTitleKey, '').subscribe({
          next: (texts: LanguagesTextDto[]) => {
            if (texts && Array.isArray(texts) && texts.length > 0) {
              texts.forEach(text => {
                if (text.languageName && text.value && text.id) {
                  this.localizedTitles[text.languageName] = text.value;
                  this.localizedTitleIds[text.languageName] = text.id;
                }
              });
            } else {
              this.localizedTitles['default'] = this.issuesType.title;
            }
            this.cd.detectChanges();
          },
          error: () => {
            this.notify.error(this.l('FailedToLoadLocalizedData'));
            this.localizedTitles['default'] = this.issuesType.title || '';
            this.cd.detectChanges();
          }
        });

        // Fetch description localizations
        if (this.originalDescriptionKey) {
          this._languagesTextService.getByKey(this.originalDescriptionKey, '').subscribe({
            next: (texts: LanguagesTextDto[]) => {
              if (texts && Array.isArray(texts) && texts.length > 0) {
                texts.forEach(text => {
                  if (text.languageName && text.value && text.id) {
                    this.localizedDescriptions[text.languageName] = text.value;
                    this.localizedDescriptionIds[text.languageName] = text.id;
                  }
                });
              } else {
                this.localizedDescriptions['default'] = this.issuesType.description || '';
              }
              this.cd.detectChanges();
            },
            error: () => {
              this.notify.error(this.l('FailedToLoadLocalizedData'));
              this.localizedDescriptions['default'] = this.issuesType.description || '';
              this.cd.detectChanges();
            }
          });
        } else {
          this.localizedDescriptions['default'] = '';
          this.cd.detectChanges();
        }
      },
      error: () => {
        this.notify.error(this.l('FailedToLoadIssuesType'));
        this.cd.detectChanges();
      }
    });
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
      description: this.localizedDescriptions['en'] || this.localizedDescriptions['default'] || ''
    });

    this._issuesTypeService.update(issuesTypeData).subscribe({
      next: () => {
        const titleKey = this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '');
        const descriptionKey = this.normalizeKey(this.localizedDescriptions['en'] || this.localizedDescriptions['default'] || '');
        const languageTextPromises = [];

        // Update title localizations
        Object.keys(this.localizedTitles)
          .filter(lang => lang !== 'default' && this.localizedTitles[lang] && this.localizedTitles[lang].trim() !== '' && this.localizedTitleIds[lang] > 0)
          .forEach(lang => {
            const textDto = new UpdateLanguagesTextDto();
            textDto.init({
              id: this.localizedTitleIds[lang],
              value: this.localizedTitles[lang],
              key: titleKey
            });
            languageTextPromises.push(this._languagesTextService.update(textDto).toPromise());
          });

        // Update description localizations
        Object.keys(this.localizedDescriptions)
          .filter(lang => lang !== 'default' && this.localizedDescriptions[lang] && this.localizedDescriptions[lang].trim() !== '' && this.localizedDescriptionIds[lang] > 0)
          .forEach(lang => {
            const textDto = new UpdateLanguagesTextDto();
            textDto.init({
              id: this.localizedDescriptionIds[lang],
              value: this.localizedDescriptions[lang],
              key: descriptionKey
            });
            languageTextPromises.push(this._languagesTextService.update(textDto).toPromise());
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

  ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();
  }
}