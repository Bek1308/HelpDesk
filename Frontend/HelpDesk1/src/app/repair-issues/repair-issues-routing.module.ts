import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepairIssuesComponent } from './repair-issues.component';

const routes: Routes = [{ path: '', component: RepairIssuesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepairIssuesRoutingModule { }
