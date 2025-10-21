// src/app/features/admin/bed-types/bed-types-list.component.ts
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../core/services/admin.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

// Definimos una interfaz para la estructura de nuestros datos
export interface BedType {
  id: number;
  name: string;
}

@Component({
  selector: 'app-bed-types-list',
  templateUrl: './bed-types-list.component.html',
  styleUrls: ['./bed-types-list.component.scss'],
  standalone: false
})
export class BedTypesListComponent implements OnInit {
  // Columnas que se mostrarán en la tabla
  displayedColumns: string[] = ['id', 'name', 'actions'];
  // Fuente de datos para la tabla
  dataSource: BedType[] = [];

  constructor(private adminService: AdminService, private router: Router, private dialog: MatDialog, private snack: MatSnackBar) { }

  ngOnInit(): void {
    this.loadBedTypes();
  }

  loadBedTypes(): void {
    this.adminService.getAll<BedType>('bed-types').subscribe(data => {
      this.dataSource = data;
    });
  }

  goNew(): void { this.router.navigate(['/admin/bed-types/new']); }
  goEdit(b: BedType): void { this.router.navigate(['/admin/bed-types', b.id, 'edit']); }
  delete(b: BedType): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Borrar tipo de cama', message: `¿Desea borrar el tipo de cama "${b.name}"?` } });
    ref.afterClosed().subscribe((yes:boolean)=>{ if (!yes) return; this.adminService.delete('bed-types', b.id).subscribe(()=>{ this.snack.open('Tipo de cama borrado','Cerrar',{duration:2000}); this.loadBedTypes(); }, err=> this.snack.open('Error al borrar','Cerrar',{duration:3000})); });
  }

}