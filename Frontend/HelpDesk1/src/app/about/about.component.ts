import { Component, Injector, ChangeDetectionStrategy } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { AfterViewInit, ChangeDetectorRef } from '@angular/core';

@Component({
    templateUrl: './about.component.html',
    animations: [appModuleAnimation()],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LocalizePipe],
})
export class AboutComponent extends AppComponentBase {
    constructor(injector: Injector,
                private featherIconService: FeatherIconService,
                private cdr: ChangeDetectorRef) {
        super(injector);
    }
    ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();
    this.cdr.detectChanges(); // Ikkinchi darajali yangilash
  }
}
