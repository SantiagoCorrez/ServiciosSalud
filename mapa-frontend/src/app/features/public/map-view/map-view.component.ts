// src/app/features/public/map-view/map-view.component.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import OLMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { MapDataService } from '../../../core/services/map-data.service';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SedeInfoComponent } from '../sede-info/sede-info.component';
import Overlay from 'ol/Overlay';

const REGION_COLORS: { [key: number]: string } = {
  1: 'rgba(255, 99, 132, 0.6)',   // Red
  2: 'rgba(54, 162, 235, 0.6)',   // Blue
  3: 'rgba(255, 206, 86, 0.6)',   // Yellow
  4: 'rgba(75, 192, 192, 0.6)',   // Teal
  5: 'rgba(153, 102, 255, 0.6)',  // Purple
  6: 'rgba(255, 159, 64, 0.6)',   // Orange
  7: 'rgba(199, 199, 199, 0.6)',  // Grey
  8: 'rgba(83, 102, 255, 0.6)',   // Indigo
  9: 'rgba(40, 159, 64, 0.6)',    // Green
  10: 'rgba(218, 25, 83, 0.6)',   // Orange
  11: 'rgba(153, 118, 118, 0.6)',  // Grey
  12: 'rgba(83, 102, 255, 0.6)',   // Indigo
  13: 'rgba(126, 179, 137, 0.6)',    // Green
  14: 'rgba(210, 99, 132, 0.6)',   // Pink
  15: 'rgba(83, 57, 57, 0.6)',  // Grey
  16: 'rgba(77, 85, 149, 0.6)',   // Indigo
  17: 'rgba(36, 67, 42, 0.6)',    // Green
  18: 'rgba(143, 101, 114, 0.6)',   // Pink
  // Add more if needed or use a generator
};

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatDialogModule]
})
export class MapViewComponent implements OnInit, AfterViewInit {
  @ViewChild('mapElement') mapElement!: ElementRef;
  @ViewChild('tooltip') tooltipElement!: ElementRef;

  map!: OLMap;
  // sedeLayer is no longer used for points, but we might keep it empty or remove it. 
  // Keeping it as a placeholder if needed, but logic will change.
  sedeLayer!: VectorLayer<VectorSource>;

  tooltipOverlay!: Overlay;
  layerDepartamento!: VectorLayer<VectorSource>;

  // Filter data
  healthRegions: any[] = [];
  municipalities: any[] = [];
  municipalitiesFiltered: any[] = [];
  bedTypes: any[] = [];
  services: any[] = [];
  // filtered lists for UI and search terms
  healthRegionsFiltered: any[] = [];
  servicesFiltered: any[] = [];
  bedTypesFiltered: any[] = [];

  search = {
    region: '',
    municipality: '',
    bedType: '',
    service: ''
  };

  filters: { healthRegionId?: number | null, municipalityId?: number | null, bedTypeId?: number | null, serviceId?: number | null } = {
    healthRegionId: null,
    municipalityId: null,
    bedTypeId: null,
    serviceId: null
  };

  // Aggregated data map: Municipality ID -> { totalServices, totalBeds, sedes: [] }
  municipalityData = new Map<number, { totalServices: number, totalBeds: number, sedes: any[] }>();

  // Map Municipality ID -> Health Region ID
  municipalityRegionMap = new Map<number, number>();
  showFilters: boolean = false;

  constructor(private mapDataService: MapDataService, public dialog: MatDialog) { }

  ngOnInit(): void { }
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  ngAfterViewInit(): void {
    this.initMap();
    this.loadReferenceLists();
    this.loadSedes();
  }

  private initMap(): void {
    // Create tooltip overlay
    this.tooltipOverlay = new Overlay({
      element: this.tooltipElement.nativeElement,
      offset: [10, 0],
      positioning: 'bottom-left'
    });

    this.layerDepartamento = new VectorLayer({
      source: new VectorSource({
        url: '/capas/Municipios_DANE.geojson',
        format: new GeoJSON()
      }),
      visible: true,
      style: (feature) => {
        const props = feature.getProperties();
        const munId = parseInt(props['muncodigo'], 10);
        const regionId = this.municipalityRegionMap.get(munId);

        let fillColor = 'rgba(255, 255, 255, 0.1)'; // Default transparent
        if (regionId && REGION_COLORS[regionId]) {
          fillColor = REGION_COLORS[regionId];
        }

        return new Style({
          stroke: new Stroke({
            color: '#3388ff',
            width: 2
          }),
          fill: new Fill({
            color: fillColor
          })
        });
      }
    });

    this.sedeLayer = new VectorLayer({
      source: new VectorSource({
        features: []
      }),
      // Style is irrelevant as we won't add features, but keeping it valid
      style: new Style({})
    });

    this.map = new OLMap({
      target: this.mapElement.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.layerDepartamento,
        this.sedeLayer
      ],
      overlays: [this.tooltipOverlay],
      view: new View({
        center: fromLonLat([-74, 5]),
        zoom: 9,
        minZoom: 8,
        maxZoom: 18
      })
    });

    // Pointer move for tooltip
    this.map.on('pointermove', (evt) => {
      if (evt.dragging) {
        this.tooltipOverlay.setPosition(undefined);
        return;
      }

      const pixel = this.map.getEventPixel(evt.originalEvent);
      const feature = this.map.forEachFeatureAtPixel(pixel, (feature) => feature);

      if (feature) {
        const props = feature.getProperties();
        // Check if it's a municipality feature (has muncodigo)
        if (props['muncodigo']) {
          const munId = parseInt(props['muncodigo'], 10);
          const data = this.municipalityData.get(munId);

          const munName = props['munnombre'] || 'Municipio';
          let tooltipContent = `<strong>${munName}</strong><br/>`;

          if (data) {
            tooltipContent += `Servicios: ${data.totalServices}<br/>Camas: ${data.totalBeds}`;
          } else {
            tooltipContent += `Sin datos registrados`;
          }

          this.tooltipElement.nativeElement.innerHTML = tooltipContent;
          this.tooltipElement.nativeElement.style.display = 'block';
          this.tooltipOverlay.setPosition(evt.coordinate);
        } else {
          this.tooltipElement.nativeElement.style.display = 'none';
        }
      } else {
        this.tooltipElement.nativeElement.style.display = 'none';
      }
    });

    // Handle map clicks to show info for municipality
    this.map.on('singleclick', evt => {
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);

      if (feature) {
        const props = feature.getProperties();
        if (props['muncodigo']) {
          const munId = parseInt(props['muncodigo'], 10);
          const data = this.municipalityData.get(munId);

          if (data && data.sedes.length > 0) {
            // Open dialog with the list of sedes
            this.dialog.open(SedeInfoComponent, {
              data: {
                props: data.sedes // Pass the array of sede properties
              }
            });
          }
        }
      }
    });
  }

  private loadReferenceLists(): void {
    this.mapDataService.getHealthRegions().subscribe((res: any) => this.healthRegions = res || []);
    this.mapDataService.getMunicipalities().subscribe((res: any) => {
      this.municipalities = res || [];
      // initially no region selected -> show all
      this.municipalitiesFiltered = this.municipalities;

      // Populate municipality -> region map
      this.municipalities.forEach(m => {
        if (m.HealthRegion && m.HealthRegion.id) {
          this.municipalityRegionMap.set(m.id, m.HealthRegion.id);
        }
      });
      // Refresh layer style to apply colors now that we have the map
      if (this.layerDepartamento) {
        this.layerDepartamento.changed();
      }
    });
    this.mapDataService.getBedTypes().subscribe((res: any) => this.bedTypes = res || []);
    this.mapDataService.getServices().subscribe((res: any) => this.services = res || []);
  }

  // ensure filtered copies are kept in sync after data loads
  private ngDoCheck(): void {
    if (this.servicesFiltered.length === 0 && this.services.length) this.servicesFiltered = this.services;
    if (this.bedTypesFiltered.length === 0 && this.bedTypes.length) this.bedTypesFiltered = this.bedTypes;
    if (this.healthRegionsFiltered.length === 0 && this.healthRegions.length) this.healthRegionsFiltered = this.healthRegions;
  }

  public updateFilteredLists(): void {
    const rTerm = this.search.region.trim().toLowerCase();
    this.healthRegionsFiltered = this.healthRegions.filter(r => r.name.toLowerCase().includes(rTerm));

    const mTerm = this.search.municipality.trim().toLowerCase();
    this.municipalitiesFiltered = this.municipalitiesFiltered.filter(m => m.name.toLowerCase().includes(mTerm));

    const sTerm = this.search.service.trim().toLowerCase();
    this.servicesFiltered = this.services.filter(s => s.name.toLowerCase().includes(sTerm));

    const bTerm = this.search.bedType.trim().toLowerCase();
    this.bedTypesFiltered = this.bedTypes.filter(b => b.name.toLowerCase().includes(bTerm));
  }

  // When municipality changes, try to load details to filter services/bed types available in that municipality
  async onMunicipalityChange(): Promise<void> {
    if (this.filters.municipalityId) {
      try {
        const details: any = await this.mapDataService.getMunicipalityDetails(this.filters.municipalityId).toPromise();
        // details.sedes is an array; aggregate available services and bedTypes
        const svcMap = new globalThis.Map<number, any>();
        const bedTypeMap = new globalThis.Map<number, any>();
        for (const s of details.sedes || []) {
          for (const svc of s.services || []) svcMap.set(svc.id, svc);
          for (const b of s.bedCounts || []) bedTypeMap.set(b.BedTypeId, b.BedTypeId);
        }
        this.servicesFiltered = this.services.filter(s => svcMap.has(s.id));
        this.bedTypesFiltered = this.bedTypes.filter(b => bedTypeMap.has(b.id));
      } catch (err) {
        console.error('Error fetching municipality details', err);
        this.servicesFiltered = this.services;
        this.bedTypesFiltered = this.bedTypes;
      }
    } else {
      this.servicesFiltered = this.services;
      this.bedTypesFiltered = this.bedTypes;
    }
    // apply search filters
    this.updateFilteredLists();
    this.loadSedes();
  }

  onFilterChange(): void {
    this.loadSedes();
  }

  onRegionChange(): void {
    const regionId = this.filters.healthRegionId;
    if (regionId) {
      this.municipalitiesFiltered = this.municipalities.filter(m => m.HealthRegion && m.HealthRegion.id === regionId);
    } else {
      this.municipalitiesFiltered = this.municipalities;
    }

    // If selected municipality is not in filtered list, clear it
    if (this.filters.municipalityId) {
      const found = this.municipalitiesFiltered.some(m => m.id === this.filters.municipalityId);
      if (!found) this.filters.municipalityId = null;
    }

    this.loadSedes();
  }

  private loadSedes(): void {
    this.mapDataService.getSedesGeoJSON(this.filters).subscribe((geojson: any) => {
      // Clear previous aggregation
      this.municipalityData.clear();

      if (geojson && geojson.features) {
        const format = new GeoJSON();
        // We read features just to access properties easily, though raw iteration is also fine.
        // However, we don't add them to the map.
        const sedeFeatures = format.readFeatures(geojson);

        sedeFeatures.forEach(sedeFeature => {
          const props = sedeFeature.getProperties();
          const municipality = props['municipality'];

          if (municipality && municipality.id) {
            const munId = municipality.id;

            if (!this.municipalityData.has(munId)) {
              this.municipalityData.set(munId, { totalServices: 0, totalBeds: 0, sedes: [] });
            }

            const data = this.municipalityData.get(munId)!;

            // Aggregate Services
            const services = props['services'] || [];
            // Assuming we count total services offered (sum of services list length for each sede)
            // Or distinct services? User said "suma de los servicios", usually means total count.
            data.totalServices += services.length;

            // Aggregate Beds
            const bedCounts = props['bedCounts'] || [];
            let bedsInSede = 0;
            bedCounts.forEach((b: any) => {
              bedsInSede += (b.initial_count || 0);
            });
            data.totalBeds += bedsInSede;

            // Add sede to list
            data.sedes.push(props);
          }
        });
      }

      // We do NOT add features to sedeLayer anymore.
      this.sedeLayer.getSource()?.clear();

      // Optional: Zoom to extent of filtered data? 
      // Since we don't have points, we can't easily get extent of points. 
      // We could calculate extent from municipality polygons if we had them linked, but simpler to leave view as is or zoom to region if selected.

    }, err => {
      console.error('Error cargando sedes', err);
    });
  }

}