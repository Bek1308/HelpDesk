import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoriesComponent } from './categories.component';
import { LocalizePipe } from "../../shared/pipes/localize.pipe";
import { CreateCategoryDto } from '@shared/api-services/category/model/category-dto.model';
import { CreateCategoryDialogComponent } from './create-category-dialog/create-category-dialog.component';
import { EditCategoryDialogComponent } from './edit-category-dialog/edit-category-dialog.component';


@NgModule({
  imports: [
    // CommonModule,
    CategoriesRoutingModule,
    CategoriesComponent,
    LocalizePipe,
    CreateCategoryDialogComponent,
    EditCategoryDialogComponent
    // LocalizePipe
]
})
export class CategoriesModule { }
