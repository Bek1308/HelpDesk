import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IssuesTypesRoutingModule } from './issues-types-routing.module';
import { IssuesTypesComponent } from './issues-types.component';
import { CreateIssuesTypeDialogComponent } from './create-issues-type-dialog/create-issues-type-dialog.component';


@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    IssuesTypesRoutingModule,
    IssuesTypesComponent,
    CreateIssuesTypeDialogComponent
  ]
})
export class IssuesTypesModule { }
