import { Component, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HeaderLeftNavbarComponent } from './header-left-navbar.component';
import { HeaderLanguageMenuComponent } from './header-language-menu.component';
import { HeaderUserMenuComponent } from './header-user-menu.component';
import { SearchDropdownComponent } from './header-searche-dropdown.component';
import { ThemeDropdownComponent } from './header-theme-dropdown.component';
import { SettingsDropdownComponent } from './header-settings-dropdown.component';
import { NotificationsDropdownComponent } from './header-notifications-dropdown.component';
import { FeatherIconService } from '../../shared/icon-service/feather-icon.service';
import { DropdownService } from '@shared/dropdown-service/dropdown.service';
import { SidebarOpenService } from '@shared/sidebar-services/sidebar-open.service';

type DropdownId = 'search' | 'theme' | 'settings' | 'notifications' | 'user-profile';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [HeaderUserMenuComponent, SearchDropdownComponent, ThemeDropdownComponent, SettingsDropdownComponent, NotificationsDropdownComponent, HeaderLanguageMenuComponent],
})
export class HeaderComponent implements AfterViewInit {
  @ViewChild('menuButton') menuButton!: ElementRef;
  @ViewChild('searchDropdown') searchDropdown!: SearchDropdownComponent;
  @ViewChild('languageDropdown') languageDropdown!: HeaderLanguageMenuComponent;
  @ViewChild('themeDropdown') themeDropdown!: ThemeDropdownComponent;
  @ViewChild('settingsDropdown') settingsDropdown!: SettingsDropdownComponent;
  @ViewChild('notificationsDropdown') notificationsDropdown!: NotificationsDropdownComponent;
  @ViewChild('headerusermenu') userProfileDropdown!: HeaderUserMenuComponent;

  

  notificationsCount = 0;
  activeDropdown: DropdownId | null = null;
  

  constructor(
    private featherIconService: FeatherIconService,
    private dropdownService: DropdownService, 
    private sidebarService: SidebarOpenService
    ) {}

    ngAfterViewInit(): void {
        this.featherIconService.replaceIcons();
        if ( this.activeDropdown== "user-profile"){
            console.log("User profile dropdown is active");
        }
    }

    toggleSidebar(): void {
        this.sidebarService.toggleSidebar();
    }

 

    setActiveDropdown(dropdownId: DropdownId): void {
        this.activeDropdown = this.activeDropdown === dropdownId ? null : dropdownId;

        const buttons = [
            this.searchDropdown.button,
            this.languageDropdown.button,
            this.themeDropdown.button,
            this.settingsDropdown.button,
            this.notificationsDropdown.button,
            this.userProfileDropdown.button
        ];
        buttons.forEach(button => {
        if (button) {
            button.nativeElement.classList.remove('active');
        }
    });

    const buttonMap: { [key: string]: ElementRef } = {
      'search': this.searchDropdown.button,
      'theme': this.languageDropdown.button,
      'language': this.themeDropdown.button, // Assuming language button is part of themeDropdown for this example
      'settings': this.settingsDropdown.button,
      'notifications': this.notificationsDropdown.button,
      'user-profile': this.userProfileDropdown.button
    };

    if (this.activeDropdown && buttonMap[this.activeDropdown]) {
      buttonMap[this.activeDropdown].nativeElement.classList.add('active');
    }

    this.dropdownService.toggleDropdown(dropdownId);
    }

       updateNotificationsCount(count: number): void {
       this.notificationsCount = count;
    }

}

