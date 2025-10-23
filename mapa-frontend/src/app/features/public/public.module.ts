import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { BedCountComponent } from 'src/app/features/public/bed-count/bed-count.component';
import { SedeServicesComponent } from 'src/app/features/public/sede-services/sede-services.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PublicRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    LoginComponent,
    SignupComponent,
    RouterModule,
    BedCountComponent,
    SedeServicesComponent
  ]
})
export class PublicModule { }
