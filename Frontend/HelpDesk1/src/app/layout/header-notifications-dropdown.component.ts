import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { KeyValuePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DropdownService } from '../../shared/dropdown-service/dropdown.service';
import { FeatherIconService } from '../../shared/icon-service/feather-icon.service';
import { dropdownAnimation } from '../../shared/dropdown-service/dropdown.animations';


interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  image: string;
  isChallenge?: boolean;
  date: Date;
  isRead: boolean;
}

@Component({
  selector: 'app-notifications-dropdown',
  templateUrl: './header-notifications-dropdown.component.html',
  standalone: true,
  imports: [KeyValuePipe],
  animations: [dropdownAnimation],
})
export class NotificationsDropdownComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('button') button!: ElementRef;
  isOpen = false;
  groupedNotifications: { [key: string]: Notification[] } = {};
  private subscription: Subscription;
  selectedNotificationId: number | null = null;

  notifications: Notification[] = [
    { id: 1, title: 'UI/UX Design', message: 'Lorem Ipsum has been the industry\'s standard dummy text...', time: '2 min ago', image: 'avatar.png', isChallenge: true, date: new Date(), isRead: false },
    { id: 2, title: 'Message', message: 'Lorem Ipsum has been the industry\'s standard dummy text...', time: '1 hour ago', image: 'avatar.png', isChallenge: false, date: new Date(), isRead: false },
    { id: 3, title: 'Forms', message: 'Lorem Ipsum has been the industry\'s standard dummy text...', time: '2 hour ago', image: 'avatar.png', isChallenge: false, date: new Date(Date.now() - 24 * 60 * 60 * 1000), isRead: true },
    { id: 4, title: 'Challenge invitation', message: '<strong>Jonny aber</strong> invites to join the challenge', time: '12 hour ago', image: 'avatar.png', isChallenge: false, date: new Date(Date.now() - 24 * 60 * 60 * 1000), isRead: false },
    { id: 5, title: 'Security', message: 'Lorem Ipsum has been the industry\'s standard dummy text...', time: '5 hour ago', image: 'avatar.png', isChallenge: false, date: new Date(Date.now() - 24 * 60 * 60 * 1000), isRead: true },
    { id: 6, title: 'UI/UX Design', message: 'Lorem Ipsum has been the industry\'s standard dummy text...', time: '3 min ago', image: 'avatar.png', date: new Date(), isRead: false },
    { id: 7, title: 'Message', message: 'Lorem Ipsum has been the industry\'s standard dummy text...', time: '2 hour ago', image: 'avatar.png', isChallenge: false, date: new Date(Date.now() - 24 * 60 * 60 * 1000), isRead: false },
    { id: 8, title: 'Forms', message: 'Lorem Ipsum has been the industry\'s standard dummy text...', time: '3 hour ago', image: 'avatar.png', isChallenge: false, date: new Date(Date.now() - 24 * 60 * 60 * 1000), isRead: true },
    { id: 9, title: 'Challenge invitation', message: '<strong>Jonny aber</strong> invites to join the challenge', time: '13 hour ago', image: 'avatar.png', isChallenge: false, date: new Date(Date.now() - 24 * 60 * 60 * 1000), isRead: false },
    { id: 10, title: 'Security', message: 'Lorem Ipsum has been the industry\'s standard dummy text...', time: '6 hour ago', image: 'avatar.png', date: new Date(Date.now() - 24 * 60 * 60 * 1000), isRead: true },
  ];

  constructor(
    private featherIconService: FeatherIconService,
    private dropdownService: DropdownService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private eRef: ElementRef
  ) {
  }

  ngOnInit(): void {
    this.groupedNotifications = this.getGroupedNotifications();
    this.subscription = this.dropdownService.dropdownState$.subscribe(state => {
      this.isOpen = state.id === 'notifications' && state.isOpen;
      if (this.isOpen) {
        this.groupedNotifications = this.getGroupedNotifications();
        this.cdr.detectChanges(); // DOMni yangilashni majburlash
      }
    });
    document.addEventListener('click', this.handleClickOutside);
  }

  ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();
    this.cdr.detectChanges(); // Ikkinchi darajali yangilash
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getGroupedNotifications() {
    return this.notifications.reduce((acc, notification) => {
      const dateKey = new Date(notification.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(notification);
      return acc;
    }, {} as { [key: string]: Notification[] });
  }

  trackByKey(index: number, item: { key: string }): string {
    return item.key;
  }

  trackById(index: number, notification: Notification): number {
    return notification.id;
  }

  toggleDropdown(): void {
    this.dropdownService.toggleDropdown('notifications');
    if (this.isOpen) {
      this.groupedNotifications = this.getGroupedNotifications();
      this.cdr.detectChanges(); // Dropdown ochilganda DOMni yangilash
    }
  }

  handleClickOutside = (event: MouseEvent) => {
    if (this.eRef.nativeElement.contains(event.target)) {
      return;
    }

    if (this.isOpen) {
      this.dropdownService.closeDropdown();
      this.cdr.detectChanges();
      
      
    }
  };

  markAllRead(event: Event): void {
    event.preventDefault();
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.groupedNotifications = this.getGroupedNotifications();
    this.cdr.detectChanges();
  }

  clearAll(event: Event): void {
    event.preventDefault();
    this.notifications = [];
    this.groupedNotifications = {};
    this.cdr.detectChanges();
  }

  declineChallenge(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.groupedNotifications = this.getGroupedNotifications();
    this.cdr.detectChanges();
  }

  acceptChallenge(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.groupedNotifications = this.getGroupedNotifications();
    this.cdr.detectChanges();
  }

  toggleActionMenu(id: number): void {
    this.selectedNotificationId = this.selectedNotificationId === id ? null : id;
    this.cdr.detectChanges();
  }

  markAsRead(id: number): void {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    this.groupedNotifications = this.getGroupedNotifications();
    this.selectedNotificationId = null;
    this.cdr.detectChanges();
  }

  deleteNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.groupedNotifications = this.getGroupedNotifications();
    this.selectedNotificationId = null;
    this.cdr.detectChanges();
  }

  sanitizeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}