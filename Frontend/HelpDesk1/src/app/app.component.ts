import { Component, Injector, OnInit, Renderer2 } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { SignalRAspNetCoreHelper } from '@shared/helpers/SignalRAspNetCoreHelper';
import { LayoutStoreService } from '@shared/layout/layout-store.service';
import { HeaderComponent } from './layout/header.component';
import { SidebarComponent } from './layout/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './layout/footer.component';
import { NgClass } from '@node_modules/@angular/common';
import { SidebarOpenService } from '@shared/sidebar-services/sidebar-open.service';
import { filter as _filter } from 'lodash-es';
import { MyIssuesComponent } from './my-issues/my-issues.component';
import { IssueDetailsComponent } from "./issue-workspace/issue-details/issue-details.component";

@Component({
    templateUrl: './app.component.html',
    standalone: true,
    imports: [HeaderComponent, NgClass, SidebarComponent, RouterOutlet, FooterComponent, IssueDetailsComponent],
})
export class AppComponent extends AppComponentBase implements OnInit {
    languages: abp.localization.ILanguageInfo[];
    currentLanguage: abp.localization.ILanguageInfo;
    sidebarExpanded: boolean;
    isMobile: boolean;

    constructor(
        injector: Injector,
        private renderer: Renderer2,
        private _layoutStore: LayoutStoreService,
        private sidebarService: SidebarOpenService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.renderer.addClass(document.body, 'sidebar-mini');

        SignalRAspNetCoreHelper.initSignalR();

        abp.event.on('abp.notifications.received', (userNotification) => {
            abp.notifications.showUiNotifyForUserNotification(userNotification);

            // Desktop notification
            Push.create('AbpZeroTemplate', {
                body: userNotification.notification.data.message,
                icon: abp.appPath + 'assets/app-logo-small.png',
                timeout: 6000,
                onClick: function () {
                    window.focus();
                    this.close();
                },
            });
        });

        this.sidebarService.sidebarExpanded$.subscribe(expanded => {
            this.sidebarExpanded = expanded;
        });

        this.languages = _filter(this.localization.languages, (l) => !l.isDisabled);
            this.currentLanguage = this.localization.currentLanguage;

        
    }

    toggleSidebar(): void {
        this._layoutStore.setSidebarExpanded(!this.sidebarExpanded);
    }
}
