// src/app/core/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = "";

  constructor(private http: HttpClient, private api: ApiService) { 
    this.apiUrl = this.api.getBaseUrl();
  }

  // Obtener todos los registros de un recurso (ej: 'bed-types')
  getAll<T>(resource: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}/${resource}`);
  }
  getById<T>(resource: string, id: number | string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${resource}/${id}`);
  }
  
  // Puedes añadir aquí los métodos create, update, delete de la misma forma
  create<T>(resource: string, data: T): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${resource}`, data);
  }

  update<T>(resource: string, id: number | string, data: T): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${resource}/${id}`, data);
  }

  delete<T>(resource: string, id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${resource}/${id}`);
  }
}