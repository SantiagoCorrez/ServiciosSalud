import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-sedes-form',
  templateUrl: './sedes-form.component.html',
  styleUrls: ['./sedes-form.component.scss'],
  standalone: false
})
export class SedesFormComponent implements OnInit {
  form: FormGroup;
  id: number | null = null;
  municipalities: any[] = [];
  isSaving = false;

  constructor(private fb: FormBuilder, private admin: AdminService, public router: Router, private route: ActivatedRoute, private snack: MatSnackBar){
    this.form = this.fb.group({ name: ['', Validators.required], address: [''], MunicipalityId: [null, Validators.required], reps_code: [''] });
  }

  ngOnInit(): void{
    this.admin.getAll('municipalities').subscribe((m:any[])=> this.municipalities = m || []);
    this.route.paramMap.subscribe(pm=>{
      const idStr = pm.get('id');
      if (idStr) {
        this.id = +idStr;
        this.admin.getById<any>('sedes', this.id).subscribe((s:any)=> this.form.patchValue({ name: s.name, address: s.address, MunicipalityId: s.MunicipalityId, reps_code: s.reps_code }));
      }
    });
  }

  trimControl(controlName: string){
    const c = this.form.get(controlName);
    if (!c) return;
    const v = c.value;
    if (typeof v === 'string') c.setValue(v.trim());
  }

  save(): void{
    if (this.form.invalid) return;
    // Trim string inputs before submit
    this.trimControl('name');
    this.trimControl('address');
    this.trimControl('reps_code');

    const payload = {
      name: this.form.value.name,
      address: this.form.value.address,
      MunicipalityId: this.form.value.MunicipalityId,
      reps_code: this.form.value.reps_code
    };

    this.isSaving = true;

    if (this.id) {
      this.admin.update('sedes', this.id, payload)
        .pipe(finalize(()=> this.isSaving = false))
        .subscribe(()=>{ this.snack.open('Sede actualizada','Cerrar',{duration:2000}); this.router.navigate(['/admin/sedes']); }, (err:any)=> this.snack.open('Error al actualizar','Cerrar',{duration:3000}));
    } else {
      this.admin.create('sedes', payload)
        .pipe(finalize(()=> this.isSaving = false))
        .subscribe(()=>{ this.snack.open('Sede creada','Cerrar',{duration:2000}); this.router.navigate(['/admin/sedes']); }, (err:any)=> this.snack.open('Error al crear','Cerrar',{duration:3000}));
    }
  }
}
