import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyIssuesRoutingModule } from './my-issues-routing.module';
import { MyIssuesComponent } from './my-issues.component';
import { IssueCardComponent } from "@app/issues/issues-card/issues-card.component";


@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    MyIssuesRoutingModule,
    IssueCardComponent
]
})
export class MyIssuesModule { }
