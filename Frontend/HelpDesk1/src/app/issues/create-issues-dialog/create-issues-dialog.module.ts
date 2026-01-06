import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassicFieldsComponent } from './category-fields/classic-fields/classic-fields.component';
import { CallCenterFieldsComponent } from './category-fields/call-center-fields/call-center-fields.component';
import { RepairFieldsComponent } from './category-fields/repair-fields/repair-fields.component';
import { TechDepartmentFieldsComponent } from './category-fields/tech-department-fields/tech-department-fields.component';
import { IssuesClaimsComponent } from './category-fields/issues-claims/issues-claims.component'
import { EditIssuesDialogComponent } from '../edit-issues-dialog/edit-issues-dialog.component';
import { ATMFieldsComponent } from './category-fields/atm-fields/atm-fields.component';
import { PayvandWalletFieldsComponent } from './category-fields/payvand-wallet-fields/payvand-wallet-fields.component';
import { PayvandCardFieldsComponent } from './category-fields/payvand-card-fields/payvand-card-fields.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ClassicFieldsComponent,
    CallCenterFieldsComponent,
    RepairFieldsComponent,
    TechDepartmentFieldsComponent,
    IssuesClaimsComponent,
    EditIssuesDialogComponent,
    ATMFieldsComponent,
    PayvandWalletFieldsComponent,
    PayvandCardFieldsComponent
    
    
  ]
})
export class CreateIssuesDialogModule { }
