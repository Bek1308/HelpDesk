import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IssuesTypesComponent } from './issues-types.component';

const routes: Routes = [{ path: '', component: IssuesTypesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IssuesTypesRoutingModule { }
