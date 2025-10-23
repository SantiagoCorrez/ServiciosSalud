import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SedeService } from '../../../../core/services/sede.service';
import { MapDataService } from '../../../../core/services/map-data.service';
import { SedeFormComponent } from '../sede-form/sede-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sede-create',
  standalone: true,
  imports: [CommonModule, SedeFormComponent],
  templateUrl: './sede-create.component.html',
  styleUrls: ['./sede-create.component.scss']
})
export class SedeCreateComponent implements OnInit {
  municipalities: any[] = [];

  constructor(
    private sedeService: SedeService,
    private mapDataService: MapDataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.mapDataService.getMunicipalities().subscribe(municipalities => {
      this.municipalities = municipalities;
    });
  }

  createSede(sede: any): void {
    this.sedeService.createSede(sede).subscribe(() => {
      this.router.navigate(['/admin']);
    });
  }
}
