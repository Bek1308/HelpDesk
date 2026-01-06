import { Component, Injector, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/app-component-base';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { FeatherIconService } from '@shared/icon-service/feather-icon.service';
import { CallCenterIssuesDto } from '@shared/api-services/call-center-issues/model/call-center-issues-dto.model';
import { CallCenterIssuesServiceProxy } from '@shared/api-services/issues/call-center-issues.service';
import { DatePipe } from '@node_modules/@angular/common';
import { AbpModalHeaderComponent } from '@shared/components/modal/abp-modal-header.component';
import { AbpModalFooterComponent } from '@shared/components/modal/abp-modal-footer.component';

@Component({
  selector: 'app-view-call-center-issues-dialog',
  standalone: true,
  imports: [LocalizePipe, AbpModalHeaderComponent, DatePipe],
  templateUrl: './view-call-center-issue-dialog.component.html',
})
export class ViewCallCenterIssueDialogComponent
  extends AppComponentBase
  implements OnInit
{
  @Input() id: number;
  callCenterIssue: CallCenterIssuesDto = new CallCenterIssuesDto();
  isLoading: boolean = true;

  constructor(
    injector: Injector,
    private _callCenterIssuesService: CallCenterIssuesServiceProxy,
    public bsModalRef: BsModalRef,
    private featherIconService: FeatherIconService,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // this.isLoading = true;
    // this._callCenterIssuesService.get(this.id).subscribe({
    //   next: (result) => {
    //     this.callCenterIssue = result;
    //     this.isLoading = false;
    //     this.cdr.detectChanges(); // Force change detection
    //   },
    //   error: () => {
    //     this.isLoading = false;
    //     this.notify.error(this.l('FailedToLoadCallCenterIssue'));
    //     this.cdr.detectChanges();
    //   },
    // });
  }

  ngAfterViewInit(): void {
    this.featherIconService.replaceIcons();
  }
}