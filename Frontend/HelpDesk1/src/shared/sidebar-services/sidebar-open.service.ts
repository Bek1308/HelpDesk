import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarOpenService {
  private isMobileSubject = new BehaviorSubject<boolean>(window.innerWidth < 1024);
  private sidebarExpandedSubject = new BehaviorSubject<boolean>(true);
  private isMobileSidebarActiveSubject = new BehaviorSubject<boolean>(false);

  isMobile$ = this.isMobileSubject.asObservable();
  sidebarExpanded$ = this.sidebarExpandedSubject.asObservable();
  isMobileSidebarActive$ = this.isMobileSidebarActiveSubject.asObservable();

  constructor() {
    window.addEventListener('resize', () => {
      const isMobile = window.innerWidth < 1024;
      this.isMobileSubject.next(isMobile);
      if (!isMobile) {
        this.isMobileSidebarActiveSubject.next(false); // Desktop holatda mobil sidebar yopiladi
      }
    });
  }

  toggleSidebar(): void {
    if (this.isMobileSubject.value) {
      const newState = !this.isMobileSidebarActiveSubject.value;
      this.isMobileSidebarActiveSubject.next(newState);
      console.log('Mobil sidebar holati:', newState);
    } else {
      const newState = !this.sidebarExpandedSubject.value;
      this.sidebarExpandedSubject.next(newState);
      console.log('Desktop sidebar holati:', newState);
    }
  }

  getSidebarExpanded(): boolean {
    return this.sidebarExpandedSubject.value;
  }

  getIsMobileSidebarActive(): boolean {
    return this.isMobileSidebarActiveSubject.value;
  }

  getIsMobile(): boolean {
    return this.isMobileSubject.value;
  }
}