import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class JwtDecoderService {

  constructor(
    private cookieService: CookieService,
    private toastr: ToastrService
  ) { }

  decodeToken(): any | null {
    const token = this.getAccessToken();

    if (!token) {
      this.toastr.warning('No active session found!');
      return null;
    }

    try {
      const decodedToken = jwtDecode(token);
      return decodedToken;
    } catch (error) {
      this.toastr.error('Invalid or expired token!');
      return null;
    }
  }

  getAccessToken(): string | null {
    return (
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token')
    );
  }
}


