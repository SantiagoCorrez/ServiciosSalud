import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SedeService {
  private apiUrl = '/api/sedes'; // Adjust if your API endpoint is different

  constructor(private http: HttpClient) { }

  getSedes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getSede(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createSede(sede: any): Observable<any> {
    return this.http.post(this.apiUrl, sede);
  }

  updateSede(id: number, sede: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, sede);
  }

  deleteSede(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
