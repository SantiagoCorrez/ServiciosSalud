import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BedTypesListComponent } from './bed-types/bed-types-list/bed-types-list.component';
import { ServicesListComponent } from './services/services-list/services-list.component';
import { MunicipalitiesListComponent } from './municipalities/municipalities-list/municipalities-list.component';
import { SedesListComponent } from './sedes/sedes-list/sedes-list.component';
import { HealthRegionsListComponent } from './health-regions/health-regions-list/health-regions-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ServicesFormComponent } from './services/services-form/services-form.component';
import { BedTypesFormComponent } from './bed-types/bed-types-form/bed-types-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { MunicipalitiesFormComponent } from './municipalities/municipalities-form/municipalities-form.component';
import { SedesFormComponent } from './sedes/sedes-form/sedes-form.component';
import { HealthRegionsFormComponent } from './health-regions/health-regions-form/health-regions-form.component';

@NgModule({
  declarations: [ServicesListComponent, BedTypesListComponent, MunicipalitiesListComponent, SedesListComponent, HealthRegionsListComponent, ServicesFormComponent, MunicipalitiesFormComponent, SedesFormComponent, HealthRegionsFormComponent, BedTypesFormComponent, ConfirmDialogComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule
    ,MatSelectModule
  ]
})
export class AdminModule { }
