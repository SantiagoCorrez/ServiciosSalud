// src/app/features/public/public-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { MapViewComponent } from './map-view/map-view.component';

const routes: Routes = [
  // Aquí irá el componente del mapa más adelante
  { path: '', component: MapViewComponent }, 
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }