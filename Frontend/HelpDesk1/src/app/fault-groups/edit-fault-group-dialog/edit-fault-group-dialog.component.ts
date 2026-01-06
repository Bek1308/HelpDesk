import { Component, Injector, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/app-component-base';
import { FormsModule } from '@angular/forms';
import { AbpModalHeaderComponent } from '@shared/components/modal/abp-modal-header.component';
import { AbpValidationSummaryComponent } from '@shared/components/validation/abp-validation.summary.component';
import { AbpModalFooterComponent } from '@shared/components/modal/abp-modal-footer.component';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { NgClass } from '@angular/common';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { LanguagesTextServiceProxy } from '@shared/api-services/localize/languages-text.service';
import { LanguagesTextDto, UpdateLanguagesTextDto } from '@shared/api-services/localize/model/languages-text-dto.model';
import { filter as _filter } from 'lodash-es';
import { FaultGroupDto } from '@shared/api-services/fault-group/model/fault-group-dto.model';
import { FaultGroupServiceProxy } from '@shared/api-services/fault-group/fault-group.service';

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
    templateUrl: 'edit-fault-group-dialog.component.html',
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
export class EditFaultGroupDialogComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();
    saving = false;
    faultGroup: FaultGroupDto = new FaultGroupDto();
    id: number;
    languages: LanguageOption[];
    currentLanguage: LanguageOption;
    localizedTitles: { [key: string]: string } = {};
    localizedTextIds: { [key: string]: number } = {};
    originalKey: string;

    constructor(
        injector: Injector,
        public _faultGroupService: FaultGroupServiceProxy,
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
            this.localizedTextIds[lang.name] = 0;
        });
        this.localizedTitles['default'] = '';

        this._faultGroupService.get(this.id).subscribe({
            next: (result: FaultGroupDto) => {
                this.faultGroup = result;
                this.originalKey = this.faultGroup.title;
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
                            this.localizedTitles['default'] = this.faultGroup.title;
                        }
                        this.cd.detectChanges();
                    },
                    error: () => {
                        this.notify.error(this.l('FailedToLoadLocalizedData'));
                        this.localizedTitles['default'] = this.faultGroup.title || '';
                        this.cd.detectChanges();
                    }
                });
            },
            error: () => {
                this.notify.error(this.l('FailedToLoadFaultGroup'));
                this.cd.detectChanges();
            }
        });
    }

    onTitleChange(value: string): void {
        this.localizedTitles[this.currentLanguage.name] = value || '';
        this.cd.detectChanges();
    }

    private normalizeKey(text: string): string {
        if (!text) return '';
        return text
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
    }

    save(): void {
        this.saving = true;

        const faultGroupData = new FaultGroupDto();
        faultGroupData.init({
            ...this.faultGroup,
            title: this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '')
        });

        this._faultGroupService.update(faultGroupData).subscribe({
            next: () => {
                const key = this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '');
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

    ngAfterViewInit(): void {
        this.featherIconService.replaceIcons();
    }
}