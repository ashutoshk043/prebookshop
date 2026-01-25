import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';

import { Apollo, gql } from 'apollo-angular';
import { jwtDecode } from 'jwt-decode';

interface CustomJwtPayload {
  user_id:string
  res_id: string;
  rest_name: string;
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
  { label: 'Users', icon: 'people', route: '/user' },
  { label: 'Restaurants', icon: 'shop', route: '/restraurent' },
  { label: 'Delivery Partners', icon: 'truck', route: '/partner' },
  { label: 'Orders', icon: 'cart', route: '/orders' },
  { label: 'Products', icon: 'box', route: '/products' },
  { label: 'Generate Report', icon: 'file-text', route: '/reports' },
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
  const LOGOUT_MUTATION = gql`
    mutation Logout {
      logout {
        message
      }
    }
  `;

  this.apollo.mutate({
    mutation: LOGOUT_MUTATION,
  }).subscribe({
    next: (res: any) => {
      this.toster.success(res.data.logout.message, 'Logout');

      // frontend cleanup
      localStorage.clear();
      sessionStorage.clear();

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
    },
    error: () => {
      this.toster.error('Logout failed');
    }
  });
}



  }
  