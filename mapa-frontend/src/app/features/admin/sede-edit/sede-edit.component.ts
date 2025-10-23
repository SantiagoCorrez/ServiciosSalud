import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SedeService } from '../../../../core/services/sede.service';
import { MapDataService } from '../../../../core/services/map-data.service';
import { SedeFormComponent } from '../sede-form/sede-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sede-edit',
  standalone: true,
  imports: [CommonModule, SedeFormComponent],
  templateUrl: './sede-edit.component.html',
  styleUrls: ['./sede-edit.component.scss']
})
export class SedeEditComponent implements OnInit {
  sede: any;
  municipalities: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sedeService: SedeService,
    private mapDataService: MapDataService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.sedeService.getSede(+id).subscribe(sede => {
        this.sede = sede;
      });
    }
    this.mapDataService.getMunicipalities().subscribe(municipalities => {
      this.municipalities = municipalities;
    });
  }

  updateSede(sede: any): void {
    if (this.sede && this.sede.id) {
      this.sedeService.updateSede(this.sede.id, sede).subscribe(() => {
        this.router.navigate(['/admin']);
      });
    }
  }
}
