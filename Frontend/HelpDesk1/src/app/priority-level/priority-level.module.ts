import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PriorityLevelRoutingModule } from './priority-level-routing.module';
import { PriorityLevelComponent } from './priority-level.component';
import { CreatePriorityLevelDialogComponent } from './create-priority-level-dialog/create-priority-level-dialog.component';
import { EditPriorityLevelDialogComponent } from './edit-priority-level-dialog/edit-priority-level-dialog.component';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    PriorityLevelRoutingModule,
    PriorityLevelComponent,
    CreatePriorityLevelDialogComponent,
    EditPriorityLevelDialogComponent
  ]
})
export class PriorityLevelModule { }
