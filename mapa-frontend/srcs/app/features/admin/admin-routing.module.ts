import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SedeListComponent } from './sede-list/sede-list.component';
import { SedeCreateComponent } from './sede-create/sede-create.component';
import { SedeEditComponent } from './sede-edit/sede-edit.component';

const routes: Routes = [
  { path: '', component: SedeListComponent },
  { path: 'sedes/new', component: SedeCreateComponent },
  { path: 'sedes/edit/:id', component: SedeEditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
