import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-health-regions-form',
  templateUrl: './health-regions-form.component.html',
  styleUrls: ['./health-regions-form.component.scss'],
  standalone: false
})
export class HealthRegionsFormComponent implements OnInit {
  form: FormGroup;
  id: number | null = null;

  constructor(private fb: FormBuilder, private admin: AdminService, public router: Router, private route: ActivatedRoute, private snack: MatSnackBar){
    this.form = this.fb.group({ name: ['', Validators.required] });
  }

  ngOnInit(): void{
    this.route.paramMap.subscribe(pm=>{ const idStr = pm.get('id'); if (idStr) { this.id = +idStr; this.admin.getById<any>('health-regions', this.id).subscribe(h=> this.form.patchValue({ name: h.name })); } });
  }

  save(): void{
    if (this.form.invalid) return;
    const payload = { name: this.form.value.name };
    if (this.id) {
      this.admin.update('health-regions', this.id, payload).subscribe(()=>{ this.snack.open('Región de salud actualizada','Cerrar',{duration:2000}); this.router.navigate(['/admin/health-regions']); }, err=> this.snack.open('Error al actualizar','Cerrar',{duration:3000}));
    } else {
      this.admin.create('health-regions', payload).subscribe(()=>{ this.snack.open('Región de salud creada','Cerrar',{duration:2000}); this.router.navigate(['/admin/health-regions']); }, err=> this.snack.open('Error al crear','Cerrar',{duration:3000}));
    }
  }
}
