import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, CommonModule]
})
export class SignupComponent {
  form: FormGroup;
  isSaving = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router){
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  passwordsMatch(fg: FormGroup){
    return fg.get('password')?.value === fg.get('confirm')?.value ? null : { mismatch: true };
  }

  submit(){
    if (this.form.invalid) return;
    this.isSaving = true;
    const payload = { name: this.form.value.name, email: this.form.value.email, password: this.form.value.password };
    this.auth.register(payload).subscribe({ next: ()=> { this.router.navigate(['/admin']); }, error: (err)=> { console.error(err); this.isSaving=false; } });
  }
}
