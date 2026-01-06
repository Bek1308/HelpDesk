import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FaultGroupsRoutingModule } from './fault-groups-routing.module';
import { FaultGroupsComponent } from './fault-groups.component';
import { EditFaultGroupDialogComponent } from './edit-fault-group-dialog/edit-fault-group-dialog.component';


@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    FaultGroupsRoutingModule,
    FaultGroupsComponent,
  ]
})
export class FaultGroupsModule { }
