import { Component, OnInit, AfterViewInit, Injector } from '@angular/core';
import { NgClass } from '@angular/common';
import { SidebarOpenService } from '@shared/sidebar-services/sidebar-open.service';
import { ThemeService } from '@shared/theme/theme.service';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { AppComponentBase } from '@shared/app-component-base';
import { SidebarLogoComponent } from './sidebar-logo.component';
import { SidebarMenuComponent } from './sidebar-menu.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, SidebarLogoComponent, SidebarMenuComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: [],
  standalone: true,
})
export class SidebarComponent extends AppComponentBase implements OnInit, AfterViewInit {
  logoUrl: string | null = 'assets/img/logo.png';
  sidebarExpanded = true;
  isMobileSidebarActive = false;
  isMobile = false;

  constructor(
    private injector: Injector,
    private featherIconService: FeatherIconService,
    private themeService: ThemeService,
    private sidebarService: SidebarOpenService,
    private cd: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.sidebarService.sidebarExpanded$.subscribe((expanded) => {
      this.sidebarExpanded = expanded;
    });
    this.sidebarService.isMobileSidebarActive$.subscribe((active) => {
      this.isMobileSidebarActive = active;
    });
    this.sidebarService.isMobile$.subscribe((isMobile) => {
      this.isMobile = isMobile;
    });
  }

  ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();
    this.cd.detectChanges();
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }
}