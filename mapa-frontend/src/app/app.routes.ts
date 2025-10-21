// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';

export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule)
  },
  // Rutas de administración protegidas por el Guard
  {
    path: 'admin',
    component: MainLayoutComponent, // Usará nuestro layout con header y sidebar
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  // Redirección por defecto
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }