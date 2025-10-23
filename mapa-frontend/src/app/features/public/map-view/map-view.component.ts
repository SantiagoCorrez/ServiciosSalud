// src/app/features/public/map-view/map-view.component.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import Map from 'ol/Map';
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
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import { toStringHDMS } from 'ol/coordinate';
import { CommonModule } from '@angular/common';
import { BedCountComponent } from '../bed-count/bed-count.component';
import { SedeServicesComponent } from '../sede-services/sede-services.component';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule, BedCountComponent, SedeServicesComponent]
})
export class MapViewComponent implements OnInit, AfterViewInit {
  @ViewChild('mapElement') mapElement!: ElementRef;
  @ViewChild('popup', { read: ElementRef }) popupElement!: ElementRef;
  map!: Map;
  sedeLayer!: VectorLayer<VectorSource>;
  popupOverlay!: Overlay;
  selectedSede: any = null;

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

  constructor(private mapDataService: MapDataService) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadReferenceLists();
    this.loadSedes();
  }

  private initMap(): void {
    
    const layerDepartamento = new VectorLayer({
      source: new VectorSource({
        url: '/capas/Municipios_DANE.geojson',
        format: new GeoJSON()
      }),
      visible: true, // inicialmente oculta
    });
    this.sedeLayer = new VectorLayer({
      source: new VectorSource({
        features: []
      }),
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: '#d9534f' }),
          stroke: new Stroke({ color: '#fff', width: 1 })
        })
      })
    });
    this.map = new Map({
      target: this.mapElement.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM()
        }), layerDepartamento
        , this.sedeLayer
      ],
      view: new View({
        center: fromLonLat([-74, 5]),
        zoom: 9,
        minZoom: 8,
        maxZoom: 18
      })
    });

    // Create popup overlay
    this.popupOverlay = new Overlay({
      element: this.popupElement?.nativeElement,
      autoPan: true
    });
    this.map.addOverlay(this.popupOverlay);

    // Close behavior for the closer link (delegated in DOM after ViewChild available)
    // We'll set the closer listener after a short timeout to ensure element exists
    setTimeout(() => {
      const closer = this.popupElement?.nativeElement.querySelector('#popup-closer');
      if (closer) {
        closer.addEventListener('click', (e: Event) => {
          e.preventDefault();
          this.popupOverlay.setPosition(undefined);
          this.selectedSede = null;
        });
      }
    }, 0);

    // Handle map clicks to show info for sede features
    this.map.on('singleclick', evt => {
      let found: any = null;
      this.map.forEachFeatureAtPixel(evt.pixel, (feat: any) => { found = feat; return true; });
      if (found) {
        const props: any = found.getProperties ? found.getProperties() : (found.properties || {});
        this.selectedSede = props;
        // Build HTML content for bedCounts and services
        const contentEl = this.popupElement.nativeElement.querySelector('#popup-content');
        let html = `<h6>${props.name || 'Sede'}</h6>`;
        if (props.municipality) html += `<div><small><strong>Municipio:</strong> ${props.municipality.name}</small></div>`;
        if (props.healthRegion) html += `<div><small><strong>Región:</strong> ${props.healthRegion.name}</small></div>`;

        if (contentEl) contentEl.innerHTML = html;
        this.popupOverlay.setPosition(evt.coordinate);
      } else {
        // click on empty space -> close popup
        this.popupOverlay.setPosition(undefined);
        this.selectedSede = null;
      }
    });
  }

  private loadReferenceLists(): void {
    this.mapDataService.getHealthRegions().subscribe((res: any) => this.healthRegions = res || []);
    this.mapDataService.getMunicipalities().subscribe((res: any) => {
      this.municipalities = res || [];
      // initially no region selected -> show all
      this.municipalitiesFiltered = this.municipalities;
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
      const format = new GeoJSON();
      const features = format.readFeatures(geojson, { featureProjection: this.map.getView().getProjection() });
      const source = this.sedeLayer.getSource() as VectorSource;
      source.clear(true);
      source.addFeatures(features);
    }, err => {
      console.error('Error cargando sedes', err);
    });
  }

}
