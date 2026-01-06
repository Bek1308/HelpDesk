import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesRoutingModule } from './services-routing.module';
import { ServicesComponent } from './services.component';
import { CreateServiceDialogComponent } from './create-service-dialog/create-service-dialog.component';
import { EditServiceDialogComponent } from './edit-service-dialog/edit-service-dialog.component';


@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    CreateServiceDialogComponent,
    EditServiceDialogComponent,
    ServicesComponent
  ]
})
export class ServicesModule { }
