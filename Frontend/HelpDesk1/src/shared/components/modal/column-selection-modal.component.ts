import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AbpModalHeaderComponent } from './abp-modal-header.component';
import { AbpModalFooterComponent } from './abp-modal-footer.component';

@Component({
    selector: 'app-column-selection-modal',
    templateUrl: './column-selection-modal.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule, LocalizePipe, AbpModalHeaderComponent, AbpModalFooterComponent],
})
export class ColumnSelectionModalComponent {
    @Input() availableColumns: { key: string; label: string; selected: boolean }[] = [];
    @Output() saveColumns = new EventEmitter<{ key: string; label: string; selected: boolean }[]>();
    saving = false;

    constructor(public bsModalRef: BsModalRef) {}

    onColumnSelectionChange(): void {
        console.log('Column selection changed:', this.availableColumns);
        // No additional logic needed since ngModel updates availableColumns directly
    }

    save(): void {
        console.log('Save method called with columns:', this.availableColumns);
        this.saving = true;
        // Deep copy to avoid reference issues
        const columnsCopy = JSON.parse(JSON.stringify(this.availableColumns));
        this.saveColumns.emit(columnsCopy);
        this.bsModalRef.hide();
        this.saving = false;
    }

    close(): void {
        console.log('Close method called');
        this.bsModalRef.hide();
    }
}