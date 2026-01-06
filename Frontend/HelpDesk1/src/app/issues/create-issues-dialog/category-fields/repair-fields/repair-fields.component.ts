import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CreateIssuesDto, RepairIssueCommandDto } from '@shared/api-services/issues/model/issues-dto.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { AbpValidationSummaryComponent } from '@shared/components/validation/abp-validation.summary.component';

@Component({
  selector: 'app-repair-fields',
  templateUrl: './repair-fields.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LocalizePipe,
    AbpValidationSummaryComponent,
  ],
})
export class RepairFieldsComponent implements OnInit {
  @Input() issue: CreateIssuesDto;
  @Input() form: NgForm;

  ngOnInit(): void {
    if (!this.issue.repairData) {
      this.issue.repairData = new RepairIssueCommandDto();
    }
  }
}
