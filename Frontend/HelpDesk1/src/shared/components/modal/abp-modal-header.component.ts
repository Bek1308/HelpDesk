import { Component, input, output, EventEmitter, ChangeDetectionStrategy, Injector } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';

@Component({
    selector: 'abp-modal-header',
    templateUrl: './abp-modal-header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class AbpModalHeaderComponent extends AppComponentBase {
    title = input<string>();

    onCloseClick = output<EventEmitter<number>>();

    constructor(
        injector: Injector,
        private featherIconService: FeatherIconService,

    ) {
        super(injector);
    }
    ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();

  }
}
