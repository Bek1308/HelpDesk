import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BonusSystemsRoutingModule } from './bonus-systems-routing.module';
import { BonusSystemsComponent } from './bonus-systems.component';
import { CreateEditBonusSystemDialogComponent } from './create-bonus-system/create-bonus-system.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    BonusSystemsRoutingModule,
    BonusSystemsComponent,
    CreateEditBonusSystemDialogComponent
  ]
})
export class BonusSystemsModule { }
