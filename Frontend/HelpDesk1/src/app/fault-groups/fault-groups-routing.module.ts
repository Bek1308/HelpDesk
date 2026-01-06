import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaultGroupsComponent } from './fault-groups.component';

const routes: Routes = [{ path: '', component: FaultGroupsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FaultGroupsRoutingModule { }
