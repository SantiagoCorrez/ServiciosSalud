import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-municipalities-form',
  templateUrl: './municipalities-form.component.html',
  styleUrls: ['./municipalities-form.component.scss'],
  standalone: false
})
export class MunicipalitiesFormComponent implements OnInit {
  form: FormGroup;
  id: number | null = null;
  healthRegions: any[] = [];

  constructor(private fb: FormBuilder, private admin: AdminService, public router: Router, private route: ActivatedRoute, private snack: MatSnackBar){
    this.form = this.fb.group({ name: ['', Validators.required], HealthRegionId: [null, Validators.required] });
  }

  ngOnInit(): void{
    this.admin.getAll('health-regions').subscribe((h:any[])=> this.healthRegions = h || []);
    this.route.paramMap.subscribe(pm=>{ const idStr = pm.get('id'); if (idStr) { this.id = +idStr; this.admin.getById<any>('municipalities', this.id).subscribe(m=> this.form.patchValue({ name: m.name, HealthRegionId: m.HealthRegionId })); } });
  }

  save(): void{
    if (this.form.invalid) return;
    const payload = { name: this.form.value.name, HealthRegionId: this.form.value.HealthRegionId };
    if (this.id) {
      this.admin.update('municipalities', this.id, payload).subscribe(()=>{ this.snack.open('Municipio actualizado','Cerrar',{duration:2000}); this.router.navigate(['/admin/municipalities']); }, err=> this.snack.open('Error al actualizar','Cerrar',{duration:3000}));
    } else {
      this.admin.create('municipalities', payload).subscribe(()=>{ this.snack.open('Municipio creado','Cerrar',{duration:2000}); this.router.navigate(['/admin/municipalities']); }, err=> this.snack.open('Error al crear','Cerrar',{duration:3000}));
    }
  }
}
