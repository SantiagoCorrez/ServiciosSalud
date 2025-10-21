import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services-form',
  templateUrl: './services-form.component.html',
  styleUrls: ['./services-form.component.scss'],standalone:false
})
export class ServicesFormComponent implements OnInit {
  form: FormGroup;
  id: number | null = null;

  constructor(private fb: FormBuilder, private admin: AdminService, private router: Router, private route: ActivatedRoute, private snack: MatSnackBar){
    this.form = this.fb.group({ name: ['', Validators.required] });
  }

  ngOnInit(): void{
    this.route.paramMap.subscribe(pm=>{
      const idStr = pm.get('id');
      if (idStr) {
        this.id = +idStr;
        this.admin.getById<any>('services', this.id).subscribe(s => this.form.patchValue({ name: s.name }));
      }
    });
  }

  save(): void{
    if (this.form.invalid) return;
    const payload = { name: this.form.value.name };
    if (this.id) {
      this.admin.update('services', this.id, payload).subscribe(()=>{ this.snack.open('Servicio actualizado','Cerrar',{duration:2000}); this.router.navigate(['/admin/services']); }, err=> this.snack.open('Error al actualizar','Cerrar',{duration:3000}));
    } else {
      this.admin.create('services', payload).subscribe(()=>{ this.snack.open('Servicio creado','Cerrar',{duration:2000}); this.router.navigate(['/admin/services']); }, err=> this.snack.open('Error al crear','Cerrar',{duration:3000}));
    }
  }

  cancel(): void { this.router.navigate(['/admin/services']); }
}
