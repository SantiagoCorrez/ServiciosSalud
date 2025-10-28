// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = '/api'; // La URL de tu backend

  constructor(private http: HttpClient) { }

  // Aquí añadiremos los métodos GET, POST, PUT, DELETE más adelante
  
  getBaseUrl(): string {
    return this.baseUrl;
  }
}