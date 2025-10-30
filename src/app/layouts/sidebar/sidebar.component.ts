import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';

import { Apollo, gql } from 'apollo-angular';
import { jwtDecode } from 'jwt-decode';

interface CustomJwtPayload {
  rest_id: string;
  res_name: string;
  iat?: number;
  exp?: number;
}


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
isCollapsed: boolean = false;
  isMobile: boolean = false;
  isMobileMenuOpen: boolean = false;
  restId:string=''

  @Output() sidebarStateChange = new EventEmitter<boolean>();

  menuItems = [
    { label: 'Home', icon: 'home', route: '/home' },
    { label: 'Users', icon: 'users', route: '/user' },
    { label: 'Orders', icon: 'orders', route: '/orders' },
    { label: 'Products', icon: 'products', route: '/products' },
    { label: 'Generate Report', icon: 'reports', route: '/reports' }
  ];

  constructor(private router: Router, private toster:ToastrService, private cookieservice:CookieService, private apollo:Apollo) {}

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleSidebar(): void {
    if (!this.isMobile) {
      this.isCollapsed = !this.isCollapsed;
      this.sidebarStateChange.emit(this.isCollapsed);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onNavClick(): void {
    if (this.isMobile) {
      this.closeMobileMenu();
    }
  }


logout(): void {
    try {
      const token = this.cookieservice.get('auth_token');

      if (!token) {
        this.toster.warning('No active session found!');
        return;
      }

      // ✅ Decode token to get rest_id
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      const restId = decodedToken?.rest_id;

      if (!restId) {
        this.toster.error('Invalid token. Please login again.');
        return;
      }

      // ✅ GraphQL logout mutation (correct structure)
      const LOGOUT_MUTATION = gql`
        mutation Logout($restId: String!) {
          logoutRestaurant(restId: $restId) {
            message
          }
        }
      `;

      // console.log('🚀 Sending logout request for rest_id:', restId);

      // ✅ Send mutation request
      this.apollo.mutate({
        mutation: LOGOUT_MUTATION,
        variables: { restId }
      }).subscribe({
        next: (response: any) => {
          // console.log('✅ Logout API Response:', response);

          // ✅ Clear token, storage & session
          this.cookieservice.delete('auth_token', '/');
          localStorage.clear();
          sessionStorage.clear();

          // ✅ Success toaster
          this.toster.success(response.data.logoutRestaurant.message, 'Logout Successful');

          // ✅ Redirect
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1200);
        },
        error: (err) => {
          console.error('❌ Logout API Error:', err);
          this.toster.error('Logout failed. Please try again.');
        }
      });

    } catch (error) {
      console.error('❌ Error during logout:', error);
      this.toster.error('Something went wrong during logout.');
    }
  }


  }
  