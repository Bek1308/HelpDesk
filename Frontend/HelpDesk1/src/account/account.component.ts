import { Component, OnInit, ViewEncapsulation, Injector, Renderer2 } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { AccountHeaderComponent } from './layout/account-header.component';
import { TenantChangeComponent } from './tenant/tenant-change.component';
import { RouterOutlet } from '@angular/router';
import { AccountLanguagesComponent } from './layout/account-languages.component';
import { AccountFooterComponent } from './layout/account-footer.component';
import { ThemeService } from '@shared/theme/theme.service';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { dropdownAnimation } from '@shared/dropdown-service/dropdown.animations';
import { NgClass } from '@node_modules/@angular/common';


@Component({
    templateUrl: './account.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        AccountHeaderComponent,
        TenantChangeComponent,
        RouterOutlet,
        AccountLanguagesComponent,
        AccountFooterComponent,
        NgClass 
  
    ],
    animations: [dropdownAnimation]
})
export class AccountComponent extends AppComponentBase implements OnInit {
    isDarkTheme: boolean; 

    constructor(
        injector: Injector,
        public themeService: ThemeService,
        private featherIconService: FeatherIconService,
        private renderer: Renderer2
    ) {
        super(injector);
        this.isDarkTheme = this.themeService.getCurrentTheme() === 'dark';
    }

    showTenantChange(): boolean {
        return abp.multiTenancy.isEnabled;
    }

    ngOnInit(): void {
        this.renderer.addClass(document.body, 'login-page');
    }

    toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkTheme = this.themeService.getCurrentTheme() === 'dark';
  }
}
