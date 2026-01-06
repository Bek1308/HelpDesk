import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  Injector
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AppComponentBase } from '@shared/app-component-base';
import { UserServiceProxy, ChangeUserLanguageDto } from '@shared/service-proxies/service-proxies';
import { filter as _filter } from 'lodash-es';
import { DropdownService } from '../../shared/dropdown-service/dropdown.service';
import { dropdownAnimation } from '../../shared/dropdown-service/dropdown.animations';
import { NgClass} from '@angular/common';
import { FeatherIconService } from '../../shared/icon-service/feather-icon.service';

interface LanguageOption {
  name: string;
  displayName: string;
  icon: string;
}

@Component({
  selector: 'header-language-menu',
  templateUrl: './header-language-menu.component.html',
  standalone: true,
  animations: [dropdownAnimation]
})
export class HeaderLanguageMenuComponent extends AppComponentBase implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('button') button!: ElementRef;
  isOpen = false;

  languages: LanguageOption[];
  currentLanguage: LanguageOption;
  private subscription!: Subscription;

  constructor(
    injector: Injector,
    private _userService: UserServiceProxy,
    private dropdownService: DropdownService,
    private eRef: ElementRef,
    private featherIconService: FeatherIconService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.languages = _filter(this.localization.languages, (l) => !l.isDisabled).map(l => ({
      name: l.name,
      displayName: l.displayName,
      icon: l.icon
    }));
    this.currentLanguage = this.localization.currentLanguage;
   

    this.subscription = this.dropdownService.dropdownState$.subscribe(state => {
      this.isOpen = state.id === 'language' && state.isOpen;
    });
  }

  ngAfterViewInit(): void {
    // Ikonkalarni yangilash uchun (agar feather icons ishlatilsa)
    this.featherIconService.replaceIcons();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.dropdownService.toggleDropdown('language');
  }

  changeLanguage(languageName: string): void {
    console.log('Attempting to change language to:', languageName);
    const input = new ChangeUserLanguageDto();
    input.languageName = languageName;

    this._userService.changeLanguage(input).subscribe({
      next: () => {
        console.log('Language changed successfully:', languageName);
        abp.utils.setCookieValue(
          'Abp.Localization.CultureName',
          languageName,
          new Date(new Date().getTime() + 5 * 365 * 86400000), // 5 year
          abp.appPath
        );
        this.dropdownService.closeDropdown();
        window.location.reload();
      },
      error: (err) => {
        console.error('Language change failed:', err);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.dropdownService.closeDropdown();
    }
  }
}