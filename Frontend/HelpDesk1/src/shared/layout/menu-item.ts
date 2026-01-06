export class MenuItem {
  id?: number;
  parentId?: number;
  name?: string;
  icon?: string;
  link?: string;
  children?: MenuItem[];
  isOpen?: boolean;
  isActive?: boolean;
  isCollapsed?: boolean;
  permissionName?: string;

  constructor(name: string, link: string, icon: string, permissionName?: string, children?: MenuItem[]) {
    this.name = name;
    this.link = link;
    this.icon = icon;
    this.permissionName = permissionName;
    this.children = children;
    this.isOpen = false;
    this.isActive = false;
    this.isCollapsed = true;
  }
}