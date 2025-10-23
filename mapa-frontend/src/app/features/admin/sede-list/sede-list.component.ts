import { Component, OnInit } from '@angular/core';
import { SedeService } from '../../../../core/services/sede.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sede-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sede-list.component.html',
  styleUrls: ['./sede-list.component.scss']
})
export class SedeListComponent implements OnInit {
  sedes: any[] = [];

  constructor(private sedeService: SedeService) { }

  ngOnInit(): void {
    this.loadSedes();
  }

  loadSedes(): void {
    this.sedeService.getSedes().subscribe(sedes => {
      this.sedes = sedes;
    });
  }

  deleteSede(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta sede?')) {
      this.sedeService.deleteSede(id).subscribe(() => {
        this.loadSedes();
      });
    }
  }
}
