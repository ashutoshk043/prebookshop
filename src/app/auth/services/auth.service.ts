import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {

  // 🔐 Access Token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  setAccessToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  // 🔁 Refresh Token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  setRefreshToken(token: string) {
    localStorage.setItem('refresh_token', token);
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}
