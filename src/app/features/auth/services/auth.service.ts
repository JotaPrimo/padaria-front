import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';
import { AuthUser, LoginResponse } from '../models/login-response.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const API_URL = 'http://localhost:8080/api/v1/auth/login';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _user = signal<AuthUser | null>(null);
  readonly user = this._user.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        try {
          this._user.set(JSON.parse(stored));
        } catch {
          this.clearStorage();
        }
      }
    }
  }

  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(API_URL, request).pipe(
      tap((response) => {
        if (response.success) {
          this._user.set(response.data);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(TOKEN_KEY, response.data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(response.data));
          }
        }
      })
    );
  }

  logout() {
    this._user.set(null);
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this._user() !== null;
  }

  isAdmin(): boolean {
    return this._user()?.role === 'ADMINISTRADOR';
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  private clearStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
}
