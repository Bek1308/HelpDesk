import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BonusSystemsComponent } from './bonus-systems.component';

const routes: Routes = [{ path: '', component: BonusSystemsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BonusSystemsRoutingModule { }
