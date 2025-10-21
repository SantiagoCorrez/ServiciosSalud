import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MapDataService {

  constructor(private http: HttpClient, private api: ApiService) { }

  getHealthRegions(): Observable<any> {
    return this.http.get(`${this.api.getBaseUrl()}/public/HeathRegions`);
  }

  getMunicipalities(): Observable<any> {
    return this.http.get(`${this.api.getBaseUrl()}/public/Municipalities`);
  }

  getBedTypes(): Observable<any> {
    return this.http.get(`${this.api.getBaseUrl()}/public/bedTypes`);
  }

  getServices(): Observable<any> {
    return this.http.get(`${this.api.getBaseUrl()}/public/Services`);
  }

  getMunicipalityDetails(id: number): Observable<any> {
    return this.http.get(`${this.api.getBaseUrl()}/public/details/${id}`);
  }

  // Fetch sedes as GeoJSON FeatureCollection with optional filters
  getSedesGeoJSON(filters: { healthRegionId?: number | null, municipalityId?: number | null, bedTypeId?: number | null, serviceId?: number | null } = {}): Observable<any> {
    const url = `${this.api.getBaseUrl()}/public/sedes-geojson`;
    let params = new HttpParams();
    if (filters.healthRegionId) params = params.set('healthRegionId', String(filters.healthRegionId));
    if (filters.municipalityId) params = params.set('municipalityId', String(filters.municipalityId));
    if (filters.bedTypeId) params = params.set('bedTypeId', String(filters.bedTypeId));
    if (filters.serviceId) params = params.set('serviceId', String(filters.serviceId));
    return this.http.get(url, { params });
  }
 
}
