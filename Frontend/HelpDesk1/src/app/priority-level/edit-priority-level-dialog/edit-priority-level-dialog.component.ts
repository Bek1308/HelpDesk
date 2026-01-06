import { Component, Injector, OnInit, Output, EventEmitter, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/app-component-base';
import { FormsModule } from '@angular/forms';
import { AbpModalHeaderComponent } from '../../../shared/components/modal/abp-modal-header.component';
import { AbpValidationSummaryComponent } from '../../../shared/components/validation/abp-validation.summary.component';
import { AbpModalFooterComponent } from '../../../shared/components/modal/abp-modal-footer.component';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { NgClass, NgStyle } from '@angular/common';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { PriorityLevelDto } from '../../../shared/api-services/priority-level/model/priority-level-dto.model';
import { PriorityLevelServiceProxy } from '../../../shared/api-services/priority-level/priority-level.service';
import { LanguagesTextServiceProxy } from '@shared/api-services/localize/languages-text.service';
import { LanguagesTextDto, UpdateLanguagesTextDto } from '@shared/api-services/localize/model/languages-text-dto.model';
import { filter as _filter } from 'lodash-es';

interface LanguageOption {
  name: string;
  displayName: string;
  icon: string;
}

@Component({
  selector: 'app-edit-priority-level-dialog',
  standalone: true,
  imports: [
    FormsModule,
    AbpModalHeaderComponent,
    AbpValidationSummaryComponent,
    AbpModalFooterComponent,
    LocalizePipe,
    NgClass,
    NgStyle
  ],
  templateUrl: './edit-priority-level-dialog.component.html',
})
export class EditPriorityLevelDialogComponent extends AppComponentBase implements OnInit, AfterViewInit {
  @Output() onSave = new EventEmitter<any>();
  saving = false;
  priorityLevel: PriorityLevelDto = new PriorityLevelDto();
  id: number;
  languages: LanguageOption[] = [];
  currentLanguage: LanguageOption;
  localizedTitles: { [key: string]: string } = {};
  localizedTextIds: { [key: string]: number } = {};
  originalKey: string;
  percentageColor: string = '#90EE90'; // Default light green

  constructor(
    injector: Injector,
    public _priorityLevelService: PriorityLevelServiceProxy,
    public _languagesTextService: LanguagesTextServiceProxy,
    public bsModalRef: BsModalRef,
    private cd: ChangeDetectorRef,
    private featherIconService: FeatherIconService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.languages = _filter(this.localization.languages, l => !l.isDisabled).map(l => ({
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

    this._priorityLevelService.getForEdit(this.id).subscribe({
      next: (result: any) => {
        this.priorityLevel = PriorityLevelDto.fromJS(result);
        this.originalKey = this.normalizeKey(this.priorityLevel.title);
        this.updatePercentageColor();
        this._languagesTextService.getByKey(this.originalKey, '').subscribe({
          next: (texts: LanguagesTextDto[]) => {
            if (texts && texts.length > 0) {
              texts.forEach(text => {
                if (text.languageName && text.value && text.id) {
                  this.localizedTitles[text.languageName] = text.value;
                  this.localizedTextIds[text.languageName] = text.id;
                }
              });
            } else {
              this.localizedTitles['default'] = this.priorityLevel.title || '';
            }
            this.cd.detectChanges();
          },
          error: () => {
            this.notify.error(this.l('FailedToLoadLocalizedData'));
            this.localizedTitles['default'] = this.priorityLevel.title || '';
            this.cd.detectChanges();
          }
        });
      },
      error: () => {
        this.notify.error(this.l('FailedToLoadPriorityLevel'));
        this.cd.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();
  }

  onTitleChange(value: string): void {
    this.localizedTitles[this.currentLanguage.name] = value || '';
    this.cd.detectChanges();
  }

  onPercentageChange(value: number): void {
    this.priorityLevel.percentage = Math.min(value || 0, 100); // Clamp to 100
    this.updatePercentageColor();
    this.cd.detectChanges();
  }

  // Restrict percentage input to max 100 during typing
  restrictPercentageInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    if (!isNaN(value) && value > 100) {
      input.value = '100'; // Force input field to 100
      this.priorityLevel.percentage = 100;
      this.updatePercentageColor();
      this.cd.detectChanges();
    }
  }

  private updatePercentageColor(): void {
    const p = Math.min(Math.max(this.priorityLevel.percentage, 0), 100);
    let r: number, g: number, b: number;

    if (p <= 33) {
      const t = p / 33;
      r = Math.round(144 + (34 - 144) * t);
      g = Math.round(238 + (139 - 238) * t);
      b = Math.round(144 + (34 - 144) * t);
    } else if (p <= 66) {
      const t = (p - 34) / 33;
      r = 255;
      g = Math.round(255 + (140 - 255) * t);
      b = Math.round(224 + (0 - 224) * t);
    } else {
      const t = (p - 67) / 33;
      r = Math.round(255 + (139 - 255) * t);
      g = Math.round(182 + (0 - 182) * t);
      b = Math.round(193 + (0 - 193) * t);
    }

    this.percentageColor = `rgb(${r}, ${g}, ${b})`;
  }

  private normalizeKey(text: string): string {
    if (!text) return '';
    return text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }

  save(): void {
    this.saving = true;

    const key = this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '');
    const priorityData = new PriorityLevelDto();
    priorityData.init({
      ...this.priorityLevel,
      title: key,
      percentage: this.priorityLevel.percentage
    });

    this._priorityLevelService.update(priorityData).subscribe({
      next: () => {
        const updates = Object.keys(this.localizedTitles)
          .filter(lang => lang !== 'default' && this.localizedTitles[lang]?.trim() && this.localizedTextIds[lang] > 0)
          .map(lang => {
            const dto = new UpdateLanguagesTextDto();
            dto.init({
              id: this.localizedTextIds[lang],
              value: this.localizedTitles[lang],
              key: key
            });
            return this._languagesTextService.update(dto).toPromise();
          });

        if (updates.length > 0) {
          Promise.all(updates)
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
      error: (error) => {
        this.saving = false;
        if (error?.error?.message === 'PercentageAlreadyExists') {
          this.notify.error(this.l('PercentageAlreadyExists'));
        } else {
          this.notify.error(this.l('SaveFailed'));
        }
      }
    });
  }

  hide(): void {
    this.bsModalRef.hide();
  }
}