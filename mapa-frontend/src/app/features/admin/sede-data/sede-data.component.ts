import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../../core/services/admin.service';
import { MapDataService } from '../../../core/services/map-data.service';

@Component({
  selector: 'app-sede-data',
  templateUrl: './sede-data.component.html',
  styleUrls: ['./sede-data.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
  ],
})
export class SedeDataComponent implements OnInit {
  healthRegions: any[] = [];
  municipalities: any[] = [];
  sedes: any[] = [];
  allServices: any[] = [];
  allBedTypes: any[] = [];

  filteredMunicipalities: any[] = [];
  filteredSedes: any[] = [];

  selectedRegionId: number | null = null;
  selectedMunicipalityId: number | null = null;
  selectedSedeId: number | null = null;

  sedeData: any = null;

  serviceDisplayedColumns: string[] = ['name', 'initial_status', 'current_status', 'projected_status', 'actions'];
  bedDisplayedColumns: string[] = ['name', 'initial_count', 'current_count', 'projected_count', 'actions'];

  newService: any = { ServiceId: null, initial_status: 0, current_status: 0, projected_status: 0 };
  newBed: any = { BedTypeId: null, initial_count: 0, current_count: 0, projected_count: 0 };

  constructor(
    private adminService: AdminService,
    private mapDataService: MapDataService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.mapDataService.getHealthRegions().subscribe(res => this.healthRegions = res || []);
    this.mapDataService.getMunicipalities().subscribe(res => this.municipalities = res || []);
    this.adminService.getAll('sedes').subscribe(res => this.sedes = res || []);
    this.adminService.getAll('services').subscribe(res => this.allServices = res || []);
    this.adminService.getAll('bed-types').subscribe(res => this.allBedTypes = res || []);
  }

  onRegionChange(): void {
    this.selectedMunicipalityId = null;
    this.selectedSedeId = null;
    this.sedeData = null;
    if (this.selectedRegionId) {
      this.filteredMunicipalities = this.municipalities.filter(m => m.HealthRegionId === this.selectedRegionId);
    } else {
      this.filteredMunicipalities = this.municipalities;
    }
    this.filteredSedes = [];
  }

  onMunicipalityChange(): void {
    this.selectedSedeId = null;
    this.sedeData = null;
    if (this.selectedMunicipalityId) {
      this.filteredSedes = this.sedes.filter(s => s.MunicipalityId === this.selectedMunicipalityId);
    } else {
      this.filteredSedes = [];
    }
  }

  onSedeChange(): void {
    if (this.selectedSedeId) {
      this.adminService.getById('sedes', `${this.selectedSedeId}/data`).subscribe(data => {
        this.sedeData = data;
      });
    } else {
      this.sedeData = null;
    }
  }

  addService(): void {
    if (this.newService.ServiceId && this.sedeData) {
      const service = this.allServices.find(s => s.id === this.newService.ServiceId);
      if (service) {
        const newSedeService = {
          ...service,
          SedeService: {
            ...this.newService
          }
        };
        this.sedeData.Services.push(newSedeService);
        this.sedeData.Services = [...this.sedeData.Services];
        this.newService = { ServiceId: null, initial_status: 0, current_status: 0, projected_status: 0 };
      }
    }
  }

  deleteService(element: any): void {
    this.sedeData.Services = this.sedeData.Services.filter((s: any) => s.id !== element.id);
  }

  addBed(): void {
    if (this.newBed.BedTypeId && this.sedeData) {
      const bedType = this.allBedTypes.find(bt => bt.id === this.newBed.BedTypeId);
      if (bedType) {
        const newBedCount = {
          ...this.newBed,
          BedType: bedType
        };
        this.sedeData.BedCounts.push(newBedCount);
        this.sedeData.BedCounts = [...this.sedeData.BedCounts];
        this.newBed = { BedTypeId: null, initial_count: 0, current_count: 0, projected_count: 0 };
      }
    }
  }

  deleteBed(element: any): void {
    this.sedeData.BedCounts = this.sedeData.BedCounts.filter((b: any) => b.BedTypeId !== element.BedTypeId);
  }

  save(): void {
    if (this.selectedSedeId && this.sedeData) {
      this.adminService.update('sedes', `${this.selectedSedeId}/data`, this.sedeData).subscribe(() => {
        console.log('Data saved successfully');
        // Optionally, refresh data
        this.onSedeChange();
      });
    }
  }
}
