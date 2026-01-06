import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IssueWorkspaceComponent } from './issue-workspace.component';

const routes: Routes = [{ path: '', component: IssueWorkspaceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IssueWorkspaceRoutingModule { }
