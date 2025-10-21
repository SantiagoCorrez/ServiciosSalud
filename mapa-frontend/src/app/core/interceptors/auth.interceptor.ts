// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si hay un token, clona la petición y añade el header de autorización
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        'x-auth-token': token
      }
    });
    return next(cloned);
  }

  // Si no hay token, deja pasar la petición original
  return next(req);
};