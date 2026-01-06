import { Injectable } from '@angular/core';
import { Console } from 'console';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  private dropdownState = new BehaviorSubject<{ id: string | null, isOpen: boolean }>({ id: null, isOpen: false });
  dropdownState$ = this.dropdownState.asObservable();

  toggleDropdown(dropdownId: string): void {
    const currentState = this.dropdownState.getValue();
    if (currentState.id === dropdownId && currentState.isOpen) {
      this.closeDropdown();
    } else {
      this.dropdownState.next({ id: dropdownId, isOpen: true });
      console.log(`Activniy dropdown hozir: ${dropdownId}`);
    }
  }

  closeDropdown(): void {
    this.dropdownState.next({ id: null, isOpen: false });
  
  }
}
