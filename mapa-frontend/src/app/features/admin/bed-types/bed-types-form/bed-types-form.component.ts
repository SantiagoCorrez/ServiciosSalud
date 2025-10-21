import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bed-types-form',
  templateUrl: './bed-types-form.component.html',
  styleUrls: ['./bed-types-form.component.scss'],
  standalone: false
})
export class BedTypesFormComponent implements OnInit {
  form: FormGroup;
  id: number | null = null;

  constructor(private fb: FormBuilder, private admin: AdminService, public router: Router, private route: ActivatedRoute, private snack: MatSnackBar){
    this.form = this.fb.group({ name: ['', Validators.required] });
  }

  ngOnInit(): void{
    this.route.paramMap.subscribe(pm=>{
      const idStr = pm.get('id');
      if (idStr) {
        this.id = +idStr;
        this.admin.getById<any>('bed-types', this.id).subscribe((b:any) => this.form.patchValue({ name: b.name }));
      }
    });
  }

  save(): void{
    if (this.form.invalid) return;
    const payload = { name: this.form.value.name };
    if (this.id) {
      this.admin.update('bed-types', this.id, payload).subscribe(()=>{ this.snack.open('Tipo de cama actualizado','Cerrar',{duration:2000}); this.router.navigate(['/admin/bed-types']); }, (err:any)=> this.snack.open('Error al actualizar','Cerrar',{duration:3000}));
    } else {
      this.admin.create('bed-types', payload).subscribe(()=>{ this.snack.open('Tipo de cama creado','Cerrar',{duration:2000}); this.router.navigate(['/admin/bed-types']); }, (err:any)=> this.snack.open('Error al crear','Cerrar',{duration:3000}));
    }
  }
}
