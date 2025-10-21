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

export interface HealthRegionItem { id: number; name: string }

@Component({
  selector: 'app-health-regions-list',
  templateUrl: './health-regions-list.component.html',
  styleUrls: ['./health-regions-list.component.scss'],
  standalone: false
})
export class HealthRegionsListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource: HealthRegionItem[] = [];
  constructor(private adminService: AdminService, private router: Router, private dialog: MatDialog, private snack: MatSnackBar){}
  ngOnInit(): void{ this.load(); }
  load(): void { this.adminService.getAll<HealthRegionItem>('health-regions').subscribe((d:HealthRegionItem[])=> this.dataSource = d ); }
  goNew(): void { this.router.navigate(['/admin/health-regions/new']); }
  goEdit(h: HealthRegionItem): void { this.router.navigate(['/admin/health-regions', h.id, 'edit']); }
  delete(h: HealthRegionItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Borrar región de salud', message: `\u00BFDesea borrar la región de salud "${h.name}"?` } });
    ref.afterClosed().subscribe((yes:boolean)=>{ if (!yes) return; this.adminService.delete('health-regions', h.id).subscribe(()=>{ this.snack.open('Región de salud borrada','Cerrar',{duration:2000}); this.load(); }, err=> this.snack.open('Error al borrar','Cerrar',{duration:3000})); });
  }
}
