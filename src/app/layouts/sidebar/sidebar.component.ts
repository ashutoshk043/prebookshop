import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

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

  @Output() sidebarStateChange = new EventEmitter<boolean>();

  menuItems = [
    { label: 'Home', icon: 'home', route: '/home' },
    { label: 'Users', icon: 'users', route: '/user' },
    { label: 'Orders', icon: 'orders', route: '/orders' },
    { label: 'Products', icon: 'products', route: '/products' },
    { label: 'Generate Report', icon: 'reports', route: '/reports' }
  ];

  constructor(private router: Router) {}

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
}