import { Component, OnInit, Injector } from '@angular/core';
import { Router, NavigationEnd, PRIMARY_OUTLET } from '@angular/router';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuItem } from '@shared/layout/menu-item';
import { AppComponentBase } from '@shared/app-component-base';
import { SidebarOpenService } from '@shared/sidebar-services/sidebar-open.service';

@Component({
  selector: 'sidebar-menu',
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: [],
  standalone: true,
})
export class SidebarMenuComponent extends AppComponentBase implements OnInit {
  menuItems: MenuItem[] = [];
  menuItemsMap: { [key: number]: MenuItem } = {};
  activatedMenuItems: MenuItem[] = [];
  sidebarCaptionHidden = false;
  sidebarExpanded = true;
  isMobile = false;

  constructor(
    private injector: Injector,
    private router: Router,
    private sidebarService: SidebarOpenService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.menuItems = this.getMenuItems();
    this.patchMenuItems(this.menuItems);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.url !== '/' ? event.url : '/tickets/all';
        const primaryUrlSegmentGroup = this.router.parseUrl(currentUrl).root.children[PRIMARY_OUTLET];
        if (primaryUrlSegmentGroup) {
          const url = '/' + primaryUrlSegmentGroup.toString();
          console.log('Current URL:', url);
          this.activateMenuItems(url);
        }
      });

    this.sidebarService.sidebarExpanded$.subscribe((expanded) => {
      this.sidebarExpanded = expanded;
    });
    this.sidebarService.isMobile$.subscribe((isMobile) => {
      this.isMobile = isMobile;
    });
  }

  getMenuItems(): MenuItem[] {
    const allItems = [
  new MenuItem('Info', '/app/home', 'inbox', undefined, [
    new MenuItem(this.l('About'), '/app/about', 'info'),
    new MenuItem(this.l('HomePage'), '/app/home', 'home'),
  ]),
    new MenuItem(this.l('Issues'), '', 'alert-circle', '', [
      new MenuItem(this.l('AllIssues'), '/app/issues', 'monitor', 'Pages.CallCenterIssues'),
      new MenuItem(this.l('TechDepartment'), '/app/tech_issues', 'hard-drive', 'Pages.CallCenterIssues'),
      new MenuItem(this.l('RepairsIssues'), '/app/repair_issues', 'cpu', 'Pages.CallCenterIssues'),
      new MenuItem(this.l('CallCenterIssues'), '/app/callcenterissues', 'phone-call', 'Pages.CallCenterIssues'),
      new MenuItem(this.l('MyIssues'), '/app/my_issues', 'award', 'Pages.CallCenterIssues'),
      
  ]),
  new MenuItem(this.l('Management'), '/app/home', 'inbox', undefined, [
    // User-related group
    new MenuItem(this.l('User Management'), '', 'users', '', [
      new MenuItem(this.l('Roles'), '/app/roles', 'server', 'Pages.Roles'),
      new MenuItem(this.l('Tenants'), '/app/tenants', 'align-center', 'Pages.Tenants'),
      new MenuItem(this.l('Users'), '/app/users', 'users', 'Pages.Users'),
    ]),
    // Other management items group
    new MenuItem(this.l('Other Management'), '', 'grid', '', [
      new MenuItem(this.l('Categories'), '/app/categories', 'grid', 'Pages.Categories'),
      new MenuItem(this.l('SubCategories'), '/app/subcategories', 'codepen', 'Pages.SubCategories'),
      new MenuItem(this.l('Services'), '/app/services', 'command', 'Pages.Services'),
      new MenuItem(this.l('PriorityLevels'), '/app/prioritylevels', 'alert-triangle', 'Pages.PriorityLevels'),
      new MenuItem(this.l('IssueTypes'), '/app/issuetypes', 'tag', 'Pages.IssueTypes'),
      new MenuItem(this.l('FaultGroups'), '/app/faultgroups', 'tag', 'Pages.FaultGroups'),
    ]),
    // CallCenterIssues stay in Management
    new MenuItem(this.l('BonusSystems'), '/app/bonus_systems', 'dollar-sign', 'Pages.IssueTypes'),
  ]),
  // Separate Issues section outside Management
];

    return this.filterVisibleItems(allItems);
  }

  filterVisibleItems(items: MenuItem[]): MenuItem[] {
    return items
      .filter((item) => this.isMenuItemVisible(item))
      .map((item) => ({
        ...item,
        children: item.children ? this.filterVisibleItems(item.children) : undefined,
      }))
      .filter((item) => !item.children || item.children.length > 0);
  }

  patchMenuItems(items: MenuItem[], parentId?: number): void {
    items.forEach((item: MenuItem, index: number) => {
      item.id = parentId ? Number(parentId + '' + (index + 1)) : index + 1;
      if (parentId) {
        item.parentId = parentId;
      }
      if (parentId || item.children) {
        this.menuItemsMap[item.id] = item;
      }
      if (item.children) {
        this.patchMenuItems(item.children, item.id);
      }
    });
  }

  activateMenuItems(url: string): void {
    this.deactivateMenuItems(this.menuItems);
    this.activatedMenuItems = [];

    const foundedItem = this.findMostRelevantMenuItem(url, this.menuItems);
    if (foundedItem) {
      console.log('Activated Item:', foundedItem.name, foundedItem.link, 'Has Children:', !!foundedItem.children);
      this.activateMenuItem(foundedItem);
    }
  }

  deactivateMenuItems(items: MenuItem[]): void {
    items.forEach((item: MenuItem) => {
      item.isActive = false;
      item.isCollapsed = true;
      item.isOpen = false;
      if (item.children) {
        this.deactivateMenuItems(item.children);
      }
    });
  }

  findMostRelevantMenuItem(url: string, items: MenuItem[]): MenuItem | null {
    let mostRelevantItem: MenuItem | null = null;
    let maxMatchLength = 0;

    const findItem = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.link && this.isMenuItemVisible(item)) {
          const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
          const normalizedLink = item.link.endsWith('/') ? item.link.slice(0, -1) : item.link;
          if (normalizedUrl === normalizedLink && normalizedLink.length > maxMatchLength) {
            mostRelevantItem = item;
            maxMatchLength = normalizedLink.length;
          }
        }
        if (item.children) {
          findItem(item.children);
        }
      });
    };

    findItem(items);
    return mostRelevantItem;
  }

  activateMenuItem(item: MenuItem): void {
    const hasActiveChild = item.children?.some(child => this.isActive(child));
    if (!hasActiveChild) {
      item.isActive = true;
    }
    item.isOpen = true;
    item.isCollapsed = false;
    this.activatedMenuItems.push(item);
    if (item.parentId) {
      const parent = this.menuItemsMap[item.parentId];
      if (parent) {
        parent.isActive = false;
        parent.isOpen = true;
        parent.isCollapsed = false;
        this.activatedMenuItems.push(parent);
        if (parent.parentId) {
          this.activateParent(parent);
        }
      }
    }
  }

  activateParent(item: MenuItem): void {
    if (item.parentId) {
      const parent = this.menuItemsMap[item.parentId];
      if (parent) {
        parent.isActive = false;
        parent.isOpen = true;
        parent.isCollapsed = false;
        this.activatedMenuItems.push(parent);
        if (parent.parentId) {
          this.activateParent(parent);
        }
      }
    }
  }

  isMenuItemVisible(item: MenuItem): boolean {
    if (!item.permissionName) {
      return true;
    }
    return this.permission.isGranted(item.permissionName);
  }

  toggleSubmenu(item: MenuItem, parent: MenuItem, level: string): void {
    if (item.children && item.isOpen) {
      item.isOpen = false;
      item.isCollapsed = true;
      item.isActive = false;
      console.log('Closed Submenu:', item.name, 'isOpen:', item.isOpen, 'isActive:', item.isActive);
    } else {
      this.deactivateMenuItems(this.menuItems);
      this.activatedMenuItems = [];

      if (item.children) {
        item.isOpen = true;
        item.isCollapsed = false;
        item.isActive = !item.children.some(child => this.isActive(child));
        this.activatedMenuItems.push(item);
        if (item.parentId) {
          this.activateParent(item);
        }
        console.log('Opened Submenu:', item.name, 'isOpen:', item.isOpen, 'isActive:', item.isActive);
      } else if (item.link) {
        this.activateMenuItem(item);
        console.log('Clicked Item:', item.name, 'Link:', item.link, 'isActive:', item.isActive);
        if (this.isMobile) {
          this.sidebarService.toggleSidebar();
        }
      }
    }

    console.log('Activated Menu Items:', this.activatedMenuItems.map(i => ({ name: i.name, isActive: i.isActive, isOpen: i.isOpen })));
  }

  isActive(item: MenuItem): boolean {
    return item.isActive || false;
  }
}