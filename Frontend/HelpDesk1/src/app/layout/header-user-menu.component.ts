import {
    Component,
    ChangeDetectionStrategy,
    ViewChild,
    ElementRef,
    Output,
    EventEmitter,
    HostListener,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ChangeDetectorRef
} from '@angular/core';
import { AppAuthService } from '@shared/auth/app-auth.service';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { Subscription } from 'rxjs';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { DropdownService } from '../../shared/dropdown-service/dropdown.service';
import { dropdownAnimation } from '../../shared/dropdown-service/dropdown.animations';

@Component({
    selector: 'header-user-menu',
    templateUrl: './header-user-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LocalizePipe],
    animations: [dropdownAnimation]
})
export class HeaderUserMenuComponent implements OnInit, OnDestroy {
    @ViewChild('button') button!: ElementRef;
    @Output() toggle = new EventEmitter<void>();

    isOpen = false;
    private subscription!: Subscription;

    user = {
        name: 'Carson Darrin',
        email: 'carson.darrin@company.io',
        avatar: 'avatar.png'
    };

    constructor(
        private _authService: AppAuthService,
        private featherIconService: FeatherIconService,
        private dropdownService: DropdownService,
        private cdr: ChangeDetectorRef,
        private eRef: ElementRef
    ) {}

    ngOnInit(): void {
        this.subscription = this.dropdownService.dropdownState$.subscribe(state => {
            // Faqat shu dropdown ochilgan bo‘lsa true bo‘ladi
            this.isOpen = state.id === 'user-profile' && state.isOpen;
            if (!this.isOpen) {
              this.cdr.detectChanges(); // Har safar ochilganda iconlarni yangilash
            }
            
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    toggleDropdown(event: MouseEvent): void {
        event.stopPropagation();
        this.toggle.emit();
        this.dropdownService.toggleDropdown('user-profile');
    }

    logout(): void {
        this._authService.logout();
    }

    // Tashqariga bosilganda yopish
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (this.isOpen && !this.eRef.nativeElement.contains(event.target)) {
            this.dropdownService.closeDropdown();
        }
    }
}
