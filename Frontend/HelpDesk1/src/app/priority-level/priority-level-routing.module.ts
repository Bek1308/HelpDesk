import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PriorityLevelComponent } from './priority-level.component';

const routes: Routes = [{ path: '', component: PriorityLevelComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PriorityLevelRoutingModule { }
