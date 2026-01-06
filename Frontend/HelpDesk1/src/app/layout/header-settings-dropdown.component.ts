import {
  AfterViewInit,
  AfterViewChecked,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DropdownService } from '../../shared/dropdown-service/dropdown.service';
import { FeatherIconService } from '../../shared/icon-service/feather-icon.service';
import { dropdownAnimation } from '../../shared/dropdown-service/dropdown.animations';

interface Actions {
  id: string;
  name: string;
  icon: string;
  action: () => void;
}

@Component({
  selector: 'app-settings-dropdown',
  templateUrl: './header-settings-dropdown.component.html',
  standalone: true,
  animations: [dropdownAnimation]
})
export class SettingsDropdownComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('button') button!: ElementRef;
  isOpen = false;
  private subscription!: Subscription;
  @Output() toggle = new EventEmitter<void>();

  actions: Actions[] = [
    { id: '1', name: 'My Account', icon: 'user', action: () => console.log('Profile clicked') },
    { id: '2', name: 'Settings', icon: 'settings', action: () => console.log('Settings clicked') },
    { id: '3', name: 'Support', icon: 'help-circle', action: () => console.log('Support clicked') },
    { id: '4', name: 'Lock Screen', icon: 'lock', action: () => console.log('Lock Screen clicked') },
    { id: '5', name: 'Logout', icon: 'log-out', action: () => console.log('Logout clicked') }
  ];

  constructor(
    private featherIconService: FeatherIconService,
    private dropdownService: DropdownService,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.subscription = this.dropdownService.dropdownState$.subscribe(state => {
      this.isOpen = state.id === 'settings' && state.isOpen;
    });
  }

  ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();
  }

  ngAfterViewChecked(): void {
    // Feather Icons'ni har safar view yangilanganda qayta ishlatish
    this.featherIconService.replaceIcons();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation(); // tugma bosilganda tashqariga click ishlamasligi uchun
    this.toggle.emit();
    this.dropdownService.toggleDropdown('settings');
  }

  // Tashqariga bosilganda yopish
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.dropdownService.closeDropdown();
    }
  }
}
