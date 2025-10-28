// src/app/features/admin/admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BedTypesListComponent } from './bed-types/bed-types-list/bed-types-list.component';
import { ServicesListComponent } from './services/services-list/services-list.component';
import { BedTypesFormComponent } from './bed-types/bed-types-form/bed-types-form.component';
import { MunicipalitiesListComponent } from './municipalities/municipalities-list/municipalities-list.component';
import { SedesListComponent } from './sedes/sedes-list/sedes-list.component';
import { HealthRegionsListComponent } from './health-regions/health-regions-list/health-regions-list.component';
import { ServicesFormComponent } from './services/services-form/services-form.component';
import { MunicipalitiesFormComponent } from './municipalities/municipalities-form/municipalities-form.component';
import { SedesFormComponent } from './sedes/sedes-form/sedes-form.component';
import { HealthRegionsFormComponent } from './health-regions/health-regions-form/health-regions-form.component';
import { SedeDataComponent } from './sede-data/sede-data.component';

const routes: Routes = [
  // Redirige la ruta /admin a /admin/bed-types por defecto
  { path: '', redirectTo: 'bed-types', pathMatch: 'full' },
  { path: 'bed-types', component: BedTypesListComponent },
  { path: 'bed-types/new', component: BedTypesFormComponent },
  { path: 'bed-types/:id/edit', component: BedTypesFormComponent },
  { path: 'services', component: ServicesListComponent },
  { path: 'services/new', component: ServicesFormComponent },
  { path: 'services/:id/edit', component: ServicesFormComponent },
  { path: 'municipalities', component: MunicipalitiesListComponent },
  { path: 'municipalities/new', component: MunicipalitiesFormComponent },
  { path: 'municipalities/:id/edit', component: MunicipalitiesFormComponent },
  { path: 'sedes', component: SedesListComponent },
  { path: 'sedes/new', component: SedesFormComponent },
  { path: 'sedes/:id/edit', component: SedesFormComponent },
  { path: 'health-regions', component: HealthRegionsListComponent },
  { path: 'health-regions/new', component: HealthRegionsFormComponent },
  { path: 'health-regions/:id/edit', component: HealthRegionsFormComponent },
  { path: 'sede-service', component: SedeDataComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }