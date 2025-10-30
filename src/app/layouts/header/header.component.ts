import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentUrl: string = '';
  currentRoute: string = '';
  restName:string=''

  constructor(private router: Router, private route: ActivatedRoute, private cookieservice:CookieService) {}

  ngOnInit(): void {
    // Listen for route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects;
        this.extractRouteName();
      });

    // Also set initially
    this.currentUrl = this.router.url;
    this.extractRouteName();
    this.getRestName()
  }

  extractRouteName() {
    // You can customize this logic as per your route pattern
    const parts = this.currentUrl.split('/');
    this.currentRoute = parts[parts.length - 1] == 'home' ? 'Dashboard' : parts[parts.length - 1];
  }

getRestName(): string | null {
  try {
    const token = this.cookieservice.get('auth_token');

    if (!token) {
      console.warn('No auth_token found in cookies');
      this.restName = ''; // clear variable if no token
      return null;
    }

    // Decode token
    const decodedToken: any = jwtDecode(token);

    // Check property exists
    if (decodedToken && decodedToken.res_name) {
      this.restName = decodedToken.res_name;
      console.log(this.restName, "✅ Restaurant Name");
      return this.restName; // ✅ return assigned variable
    } else {
      console.warn('res_name not found in decoded token:', decodedToken);
      this.restName = '';
      return null;
    }

  } catch (error) {
    console.error('Error decoding JWT:', error);
    this.restName = '';
    return null;
  }
}

}
