import {
  AfterViewInit,
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

@Component({
  selector: 'app-search-dropdown',
  templateUrl: 'header-searche-dropdown.component.html',
  standalone: true,
  animations: [dropdownAnimation]
})
export class SearchDropdownComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('button') button!: ElementRef;
  isOpen = false;
  private subscription!: Subscription;
  @Output() toggle = new EventEmitter<void>();

  constructor(
    private featherIconService: FeatherIconService,
    private dropdownService: DropdownService,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.subscription = this.dropdownService.dropdownState$.subscribe(state => {
      this.isOpen = state.id === 'search' && state.isOpen;
    });
  }

  ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation(); // Tugma bosilganda tashqi click listener ishlamasligi uchun
    this.toggle.emit();
    this.dropdownService.toggleDropdown('search');
  }

  // Tashqariga bosilganda yopish
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.dropdownService.closeDropdown();
    }
  }
}
