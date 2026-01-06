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
  HostListener,
  Injector
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DropdownService } from '../../shared/dropdown-service/dropdown.service';
import { FeatherIconService } from '../../account/icon-service/feather-icon.service';
import { ThemeService } from '../../shared/theme/theme.service';
import { dropdownAnimation } from '../../shared/dropdown-service/dropdown.animations';
import { AppComponentBase } from '@shared/app-component-base';

interface ThemeOption {
  name: string;
  value: 'light' | 'dark' | 'default';
  icon: string;
}

@Component({
  selector: 'app-theme-dropdown',
  templateUrl: './header-theme-dropdown.component.html',
  standalone: true,
  imports: [],
  animations: [dropdownAnimation]
})
export class ThemeDropdownComponent extends AppComponentBase implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('button') button!: ElementRef;
  isOpen = false;

  themes: ThemeOption[] = [
    { name: this.l('Light'), value: 'light', icon: 'sun' },
    { name: this.l('Dark'), value: 'dark', icon: 'moon' },
    { name: this.l('Default'), value: 'default', icon: 'settings' }
  ];

  private subscription!: Subscription;
  @Output() toggle = new EventEmitter<void>();

  constructor(
    private injector: Injector,
    private themeService: ThemeService,
    private featherIconService: FeatherIconService,
    private dropdownService: DropdownService,
    private eRef: ElementRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.subscription = this.dropdownService.dropdownState$.subscribe(state => {
      this.isOpen = state.id === 'theme' && state.isOpen;
    });
  }

  ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation(); // bosilganda tashqariga click ishlamasligi uchun
    this.toggle.emit();
    this.dropdownService.toggleDropdown('theme');
  }

  setTheme(theme: 'light' | 'dark' | 'default'): void {
    this.themeService.setTheme(theme);
    this.dropdownService.closeDropdown(); // tanlangandan so‘ng yopish
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.dropdownService.closeDropdown();
    }
  }
}
