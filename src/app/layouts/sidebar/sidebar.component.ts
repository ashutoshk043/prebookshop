import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { Apollo, gql } from 'apollo-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  /* ---------- UI STATES ---------- */
  isCollapsed = false;
  isMobile = false;
  isMobileMenuOpen = false;

  @Output() sidebarStateChange = new EventEmitter<boolean>();

  /* ---------- GROUP STATE ---------- */
  openGroups: Record<string, boolean> = {};
  activeGroup: string | null = null;

  /* ---------- MENU DATA ---------- */
  groupedMenu = [
    {
      title: 'MAIN',
      items: [
        { order: 1, label: 'Dashboard', route: '/home' }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { order: 1, label: 'Users', route: '/user' },
        { order: 2, label: 'Restaurants', route: '/restraurent' }
      ]
    },
    {
      title: 'PRODUCT SETUP',
      items: [
        { order: 1, label: 'Categories', route: '/categories' },
        { order: 2, label: 'Products', route: '/products' },
        { order: 3, label: 'Variant Templates', route: '/variant-templates' },
        { order: 4, label: 'Product Variants', route: '/varients' },
        { order: 5, label: 'Ingredients', route: '/ingredients' }
      ]
    },
    {
      title: 'INVENTORY',
      items: [
        { order: 1, label: 'Stock Logs', route: '/stock-logs' },
        { order: 2, label: 'Low Stock Alerts', route: '/low-stock' }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { order: 1, label: 'Orders', route: '/orders' },
        { order: 2, label: 'Tables (Dine-In)', route: '/tables' },
        { order: 3, label: 'Reports', route: '/reports' }
      ]
    },
    {
      title: 'DELIVERY MANAGEMENT',
      items: [
        {
          order: 1,
          label: 'Delivery Companies',
          icon: 'truck',
          route: '/delivery-companies'   // Global companies
        },
        {
          order: 2,
          label: 'Delivery Partners',
          icon: 'people',
          route: '/delivery-partners'    // In-house + global riders
        },
        {
          order: 3,
          label: 'Delivery Assignments',
          icon: 'cart',
          route: '/delivery-assignments' // Optional: live / manual assign
        }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { order: 1, label: 'Settings', route: '/settings' }
      ]
    }
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private apollo: Apollo
  ) { }

  /* ---------- INIT ---------- */
  ngOnInit(): void {
    this.checkScreenSize();

    // init all groups closed
    this.groupedMenu.forEach(g => this.openGroups[g.title] = false);

    // auto-open based on route
    this.setActiveGroupByRoute();
  }

  /* ---------- RESPONSIVE ---------- */
  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;

    if (!this.isMobile) {
      this.isMobileMenuOpen = false;
    }
  }

  /* ---------- GROUP TOGGLE ---------- */
  toggleGroup(title: string): void {

    // mobile → only one group open
    if (this.isMobile) {
      Object.keys(this.openGroups).forEach(key => {
        this.openGroups[key] = false;
      });
    }

    this.openGroups[title] = !this.openGroups[title];
    this.activeGroup = title;
  }

  /* ---------- AUTO HIGHLIGHT BY ROUTE ---------- */
  setActiveGroupByRoute(): void {
    const url = this.router.url;

    this.groupedMenu.forEach(group => {
      const matched = group.items.some(item =>
        url.startsWith(item.route)
      );

      if (matched) {
        this.openGroups[group.title] = true;
        this.activeGroup = group.title;
      }
    });
  }

  /* ---------- SIDEBAR ---------- */
  toggleSidebar(): void {
    if (!this.isMobile) {
      this.isCollapsed = !this.isCollapsed;
      this.sidebarStateChange.emit(this.isCollapsed);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onNavClick(groupTitle?: string): void {
    if (groupTitle) {
      this.activeGroup = groupTitle;
    }

    if (this.isMobile) {
      this.isMobileMenuOpen = false;
    }
  }

  /* ---------- LOGOUT ---------- */
  logout(): void {
    const LOGOUT_MUTATION = gql`
      mutation Logout {
        logout {
          message
        }
      }
    `;

    this.apollo.mutate({ mutation: LOGOUT_MUTATION }).subscribe({
      next: (res: any) => {
        this.toastr.success(res.data.logout.message, 'Logout');
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => this.router.navigate(['/']), 800);
      },
      error: () => this.toastr.error('Logout failed')
    });
  }
}