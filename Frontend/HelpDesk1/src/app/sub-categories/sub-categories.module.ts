import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubCategoriesRoutingModule } from './sub-categories-routing.module';
import { SubCategoriesComponent } from './sub-categories.component';


@NgModule({
  imports: [
    CommonModule,
    SubCategoriesRoutingModule,
    SubCategoriesComponent
  ]
})
export class SubCategoriesModule { }
