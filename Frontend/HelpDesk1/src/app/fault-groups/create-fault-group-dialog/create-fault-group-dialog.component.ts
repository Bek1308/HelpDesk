import { Component, Injector, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/app-component-base';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AbpModalHeaderComponent } from '@shared/components/modal/abp-modal-header.component';
import { AbpValidationSummaryComponent } from '@shared/components/validation/abp-validation.summary.component';
import { AbpModalFooterComponent } from '@shared/components/modal/abp-modal-footer.component';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { NgClass } from '@angular/common';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { LanguagesTextServiceProxy } from '@shared/api-services/localize/languages-text.service';
import { CreateLanguagesTextDto } from '@shared/api-services/localize/model/languages-text-dto.model';
import { filter as _filter } from 'lodash-es';
import { CreateFaultGroupDto } from '@shared/api-services/fault-group/model/fault-group-dto.model';
import { FaultGroupServiceProxy } from '@shared/api-services/fault-group/fault-group.service';

interface LanguageOption {
  name: string;
  displayName: string;
  icon: string;
}

@Component({
    selector: 'app-create-fault-group-dialog',
    templateUrl: './create-fault-group-dialog.component.html',
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
export class CreateFaultGroupDialogComponent extends AppComponentBase implements OnInit {
    @ViewChild('createFaultGroupForm') createFaultGroupForm: NgForm;
    @Output() onSave = new EventEmitter<any>();
    faultGroup: CreateFaultGroupDto = new CreateFaultGroupDto();
    saving = false;
    languages: LanguageOption[];
    currentLanguage: LanguageOption;
    localizedTitles: { [key: string]: string } = {};

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
        });
        this.localizedTitles['default'] = '';
        this.cd.detectChanges();
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

        const faultGroupData = new CreateFaultGroupDto();
        faultGroupData.init({
            ...this.faultGroup,
            title: this.normalizeKey(this.localizedTitles['en'] || this.localizedTitles['default'] || '')
        });

        this._faultGroupService.create(faultGroupData).subscribe(
            () => {
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