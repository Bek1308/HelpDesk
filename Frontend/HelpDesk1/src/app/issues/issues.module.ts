import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IssuesRoutingModule } from './issues-routing.module';
import { IssuesComponent } from './issues.component';
import { CreateIssuesDialogComponent } from './create-issues-dialog/create-issues-dialog.component';
import { IssueCardComponent } from './issues-card/issues-card.component';
import { CreateIssuesDialogModule } from './create-issues-dialog/create-issues-dialog.module';



@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    IssuesRoutingModule,
    CreateIssuesDialogComponent,
    IssueCardComponent,
    CreateIssuesDialogModule,
    IssuesComponent


  ]
})
export class IssuesModule { }
