import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DropdownService } from '../dropdown-service/dropdown.service';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
})
export class DropdownComponent implements OnInit, OnDestroy {
  @Input() dropdownId!: string;
  isOpen = false;
  private sub!: Subscription;

  constructor(
    private dropdownService: DropdownService,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.sub = this.dropdownService.dropdownState$.subscribe(state => {
      this.isOpen = state.id === this.dropdownId && state.isOpen;
    });

    document.addEventListener('click', this.handleClickOutside);
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.dropdownService.toggleDropdown(this.dropdownId);
  }

  handleClickOutside = (event: MouseEvent) => {
    if (this.isOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.dropdownService.closeDropdown();
    }
  };

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    document.removeEventListener('click', this.handleClickOutside);
  }
}
