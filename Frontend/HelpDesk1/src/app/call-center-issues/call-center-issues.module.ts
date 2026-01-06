import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CallCenterIssuesRoutingModule } from './call-center-issues-routing.module';
import { CallCenterIssuesComponent } from './call-center-issues.component';
// import { CreateCallCenterIssuesDialogComponent } from './create-call-center-issues-dialog/create-call-center-issues-dialog.component'
// import { EditCallCenterIssuesDialogComponent } from './edit-call-center-issues-dialog/edit-call-center-issues-dialog.component';
import { ViewCallCenterIssueDialogComponent } from './view-call-center-issue-dialog/view-call-center-issue-dialog.component';


@NgModule({
  declarations: [
    //CallCenterIssuesComponent
  ],
  imports: [
    CommonModule,
    CallCenterIssuesRoutingModule,
    CallCenterIssuesComponent,
    // CreateCallCenterIssuesDialogComponent,
    ViewCallCenterIssueDialogComponent,
    // EditCallCenterIssuesDialogComponent,

    
  ]
})
export class CallCenterIssuesModule { }
