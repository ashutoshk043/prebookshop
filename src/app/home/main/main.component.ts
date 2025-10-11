import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LayoutsModule } from '../../layouts/layouts.module';
import { UserModule } from '../../user/user.module';
import { OrdermanagementModule } from '../../ordermanagement/ordermanagement.module';
import { ProductmanagementModule } from '../../productmanagement/productmanagement.module';
import { Router } from "@angular/router";
import { HeaderComponent } from "../../layouts/header/header.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, LayoutsModule, UserModule, OrdermanagementModule, ProductmanagementModule, HeaderComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize dashboard data
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Add your API calls here to load dashboard data
    console.log('Loading dashboard data...');
  }

  menuItems = [
    { label: 'Add New Order', icon: 'orders', route: '/orders' },
    { label: 'Add New Product', icon: 'products', route: '/products' },
    { label: 'Add New User', icon: 'users', route: '/user' },
    { label: 'Generate Report', icon: 'report', route: '/home' }
  ];


  navigate(route: string) {
    this.router.navigate([route]);
  }

}
