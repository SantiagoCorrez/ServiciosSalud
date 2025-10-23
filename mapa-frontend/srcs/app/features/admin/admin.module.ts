import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { SedeListComponent } from './sede-list/sede-list.component';
import { SedeFormComponent } from './sede-form/sede-form.component';
import { SedeCreateComponent } from './sede-create/sede-create.component';
import { SedeEditComponent } from './sede-edit/sede-edit.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SedeListComponent,
    SedeFormComponent,
    SedeCreateComponent,
    SedeEditComponent
  ]
})
export class AdminModule { }
