import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyIssuesComponent } from './my-issues.component';

const routes: Routes = [{ path: '', component: MyIssuesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyIssuesRoutingModule { }
