import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  setAccessToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  setRefreshToken(token: string) {
    localStorage.setItem('refresh_token', token);
  }

  clear() {
    localStorage.clear();
    sessionStorage.clear();
  }
}
