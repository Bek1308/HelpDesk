import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallCenterIssuesComponent } from './call-center-issues.component';

const routes: Routes = [{ path: '', component: CallCenterIssuesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallCenterIssuesRoutingModule { }
