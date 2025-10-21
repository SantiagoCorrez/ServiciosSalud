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

export interface MunicipalityItem { id: number; name: string; }

@Component({
  selector: 'app-municipalities-list',
  templateUrl: './municipalities-list.component.html',
  styleUrls: ['./municipalities-list.component.scss'],
  standalone: false
})
export class MunicipalitiesListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource: MunicipalityItem[] = [];
  constructor(private adminService: AdminService, private router: Router, private dialog: MatDialog, private snack: MatSnackBar) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.adminService.getAll<MunicipalityItem>('municipalities').subscribe((d:MUN[])=> this.dataSource = d as any); }
  goNew(): void { this.router.navigate(['/admin/municipalities/new']); }
  goEdit(m: MunicipalityItem): void { this.router.navigate(['/admin/municipalities', m.id, 'edit']); }
  delete(m: MunicipalityItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Borrar municipio', message: `¿Desea borrar el municipio "${m.name}"?` } });
    ref.afterClosed().subscribe((yes:boolean)=>{ if (!yes) return; this.adminService.delete('municipalities', m.id).subscribe(()=>{ this.snack.open('Municipio borrado','Cerrar',{duration:2000}); this.load(); }, err=> this.snack.open('Error al borrar','Cerrar',{duration:3000})); });
  }
}

type MUN = MunicipalityItem;
