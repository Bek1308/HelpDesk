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
import { CreatePriorityLevelDto } from '../../../shared/api-services/priority-level/model/priority-level-dto.model';
import { PriorityLevelServiceProxy } from '../../../shared/api-services/priority-level/priority-level.service';
import { LanguagesTextServiceProxy } from '@shared/api-services/localize/languages-text.service';
import { CreateLanguagesTextDto } from '@shared/api-services/localize/model/languages-text-dto.model';
import { filter as _filter } from 'lodash-es';
import { NgStyle } from '@angular/common';

interface LanguageOption {
  name: string;
  displayName: string;
  icon: string;
}

@Component({
  selector: 'app-create-priority-level-dialog',
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
  templateUrl: './create-priority-level-dialog.component.html',
})
export class CreatePriorityLevelDialogComponent extends AppComponentBase implements OnInit {
  @Output() onSave = new EventEmitter<any>();
  saving = false;
  priorityLevel: CreatePriorityLevelDto = new CreatePriorityLevelDto();
  languages: LanguageOption[];
  currentLanguage: LanguageOption;
  localizedTitles: { [key: string]: string } = {};
  percentageColor: string = '#90EE90'; // Default to light green for 0%

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
    this.priorityLevel.percentage = 0;
    this.updatePercentageColor();
    this.cd.detectChanges();
  }

  // Handle title input changes
  onTitleChange(value: string): void {
    this.localizedTitles[this.currentLanguage.name] = value || '';
    this.cd.detectChanges();
  }

  // Handle percentage input changes
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

  // Calculate smooth color transition based on percentage
  private updatePercentageColor(): void {
    const percentage = Math.min(Math.max(this.priorityLevel.percentage, 0), 100); // Clamp between 0 and 100
    let r, g, b;

    if (percentage <= 33) {
      // Transition from light green (#90EE90, RGB: 144, 238, 144) to dark green (#228B22, RGB: 34, 139, 34)
      const t = percentage / 33; // Normalize to 0-1 for 0-33%
      r = Math.round(144 + (34 - 144) * t);
      g = Math.round(238 + (139 - 238) * t);
      b = Math.round(144 + (34 - 144) * t);
    } else if (percentage <= 66) {
      // Transition from light yellow (#FFFFE0, RGB: 255, 255, 224) to dark yellow (#FF8C00, RGB: 255, 140, 0)
      const t = (percentage - 34) / 33; // Normalize to 0-1 for 34-66%
      r = Math.round(255 + (255 - 255) * t);
      g = Math.round(255 + (140 - 255) * t);
      b = Math.round(224 + (0 - 224) * t);
    } else {
      // Transition from light red (#FFB6C1, RGB: 255, 182, 193) to dark red (#8B0000, RGB: 139, 0, 0)
      const t = (percentage - 67) / 33; // Normalize to 0-1 for 67-100%
      r = Math.round(255 + (139 - 255) * t);
      g = Math.round(182 + (0 - 182) * t);
      b = Math.round(193 + (0 - 193) * t);
    }

    this.percentageColor = `rgb(${r}, ${g}, ${b})`;
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

    const priorityLevelData = new CreatePriorityLevelDto();
    priorityLevelData.init({
      ...this.priorityLevel,
      title: this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || ''),
      percentage: this.priorityLevel.percentage
    });

    this._priorityLevelService.create(priorityLevelData).subscribe({
      next: () => {
        const key = this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '');
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
              this.notify.error(this.l('LocalizationSaveFailed'));
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

  ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();
  }
}