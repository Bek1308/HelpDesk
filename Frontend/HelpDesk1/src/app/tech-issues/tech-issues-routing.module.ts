import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TechIssuesComponent } from './tech-issues.component';

const routes: Routes = [{ path: '', component: TechIssuesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TechIssuesRoutingModule { }
