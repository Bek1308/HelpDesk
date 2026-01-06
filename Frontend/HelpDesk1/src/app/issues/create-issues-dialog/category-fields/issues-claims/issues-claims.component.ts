import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/app-component-base';
import { CreateIssuesClaimsDto } from '@shared/api-services/issues/model/issues-dto.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { AbpValidationSummaryComponent } from '@shared/components/validation/abp-validation.summary.component';

@Component({
  selector: 'app-issues-claims',
  templateUrl: './issues-claims.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LocalizePipe,
    AbpValidationSummaryComponent,
  ],
})
export class IssuesClaimsComponent extends AppComponentBase implements OnInit {
  @Input() issuesClaims: CreateIssuesClaimsDto[] = [];
  @Input() form: NgForm;
  @Output() claimsUpdated = new EventEmitter<CreateIssuesClaimsDto[]>();

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    if (!this.issuesClaims) {
      this.issuesClaims = [];
    }
  }

  addClaim(): void {
    this.issuesClaims.push(new CreateIssuesClaimsDto({ claimKey: '', claimValue: '' }));
    this.claimsUpdated.emit(this.issuesClaims);
  }

  removeClaim(index: number): void {
    this.issuesClaims.splice(index, 1);
    this.claimsUpdated.emit(this.issuesClaims);
  }
}
