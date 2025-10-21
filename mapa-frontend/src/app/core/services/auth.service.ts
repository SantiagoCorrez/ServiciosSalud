// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private api: ApiService) { }

  private apiUrl = "";
  login(credentials: any): Observable<{ token: string }> {
    this.apiUrl = `${this.api.getBaseUrl()}/auth`
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Guardamos el token en el almacenamiento local del navegador
        localStorage.setItem('authToken', response.token);
      })
    );
  }

  register(payload: any): Observable<{ token: string }> {
    this.apiUrl = `${this.api.getBaseUrl()}/auth`
    return this.http.post<{ token: string }>(`${this.apiUrl}/register`, payload).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    // Aquí podrías redirigir al usuario a la página de login
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}