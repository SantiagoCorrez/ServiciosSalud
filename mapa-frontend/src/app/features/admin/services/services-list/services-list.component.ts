// src/app/features/admin/services/services-list/services-list.component.ts
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../core/services/admin.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

export interface ServiceItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss'],
  standalone: false
})
export class ServicesListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource: ServiceItem[] = [];

  constructor(private adminService: AdminService, private router: Router, private dialog: MatDialog, private snack: MatSnackBar) { }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.adminService.getAll<ServiceItem>('services').subscribe((data: ServiceItem[]) => this.dataSource = data);
  }

  goNew(): void { this.router.navigate(['/admin/services/new']); }
  goEdit(s: ServiceItem): void { this.router.navigate(['/admin/services', s.id, 'edit']); }
  delete(s: ServiceItem): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Borrar servicio', message: `¿Desea borrar el servicio "${s.name}"?` } });
    ref.afterClosed().subscribe(yes => {
      if (!yes) return;
      this.adminService.delete('services', s.id).subscribe(()=>{ this.snack.open('Servicio borrado','Cerrar',{duration:2000}); this.loadServices(); }, err=> this.snack.open('Error al borrar','Cerrar',{duration:3000}));
    });
  }
}
