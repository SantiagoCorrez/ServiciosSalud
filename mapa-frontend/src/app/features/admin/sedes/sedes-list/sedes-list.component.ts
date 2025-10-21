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

export interface SedeItem { id: number; name: string; address?: string }

@Component({
  selector: 'app-sedes-list',
  templateUrl: './sedes-list.component.html',
  styleUrls: ['./sedes-list.component.scss'],
  standalone: false
})
export class SedesListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'address', 'actions'];
  dataSource: SedeItem[] = [];
  constructor(private adminService: AdminService, private router: Router, private dialog: MatDialog, private snack: MatSnackBar) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.adminService.getAll<SedeItem>('sedes').subscribe((d:SedeItem[])=> this.dataSource = d ); }
  goNew(): void { this.router.navigate(['/admin/sedes/new']); }
  goEdit(s: SedeItem): void { this.router.navigate(['/admin/sedes', s.id, 'edit']); }
  delete(s: SedeItem): void { const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Borrar sede', message: `¿Desea borrar la sede "${s.name}"?` } }); ref.afterClosed().subscribe((yes:boolean)=>{ if (!yes) return; this.adminService.delete('sedes', s.id).subscribe(()=>{ this.snack.open('Sede borrada','Cerrar',{duration:2000}); this.load(); }, err=> this.snack.open('Error al borrar','Cerrar',{duration:3000})); }); }
}
