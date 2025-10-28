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
import Feature from 'ol/Feature';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SedeInfoComponent } from '../sede-info/sede-info.component';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatDialogModule]
})
export class MapViewComponent implements OnInit, AfterViewInit {
  @ViewChild('mapElement') mapElement!: ElementRef;
  map!: Map;
  sedeLayer!: VectorLayer<VectorSource>;

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

  constructor(private mapDataService: MapDataService, public dialog: MatDialog) { }

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
      visible: true, // inicialmente oculta,
      style: new Style({
        stroke: new Stroke({
          color: '#3388ff',
          width: 3
        })

      })
    })
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

    // Handle map clicks to show info for sede features
    this.map.on('singleclick', evt => {
      const featuresAtPixel = this.map.getFeaturesAtPixel(evt.pixel);

      if (featuresAtPixel && featuresAtPixel.length > 0) {
        const firstFeature = featuresAtPixel[0] as Feature;
        const props = firstFeature.getProperties();

        this.dialog.open(SedeInfoComponent, {
          data: {
            props
          }
        });
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
      const finalFeatures: Feature[] = [];

      if (geojson && geojson.features) {
        const sedeFeatures = format.readFeatures(geojson, { featureProjection: this.map.getView().getProjection() });

        sedeFeatures.forEach(sedeFeature => {
          const properties = sedeFeature.getProperties();
          const services = properties['services'] || [];
          const sedeGeometry = sedeFeature.getGeometry();

          if (sedeGeometry) {
            if (services.length > 0) {
              services.forEach((service: any) => {
                const serviceProps = { ...properties };

                const serviceFeature = new Feature({
                  ...serviceProps,
                  geometry: sedeGeometry
                });
                finalFeatures.push(serviceFeature);
              });
            } else {
              // If a sede has no services, still show it as a single point.
              finalFeatures.push(sedeFeature);
            }
          }
        });
      }

      const source = this.sedeLayer.getSource() as VectorSource;
      source.clear(true);
      source.addFeatures(finalFeatures);

      if (finalFeatures.length > 0) {
        const extent = source.getExtent();
        this.map.getView().fit(extent, { padding: [100, 100, 100, 100], duration: 1000, maxZoom: 15 });
      }
    }, err => {
      console.error('Error cargando sedes', err);
    });
  }

}