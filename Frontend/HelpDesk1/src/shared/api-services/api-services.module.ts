import { NgModule } from '@angular/core';
import { CategoryServiceProxy } from './category/category.service';

@NgModule({
    providers: [
        CategoryServiceProxy
    ]
})
export class ApiServicesModule {}