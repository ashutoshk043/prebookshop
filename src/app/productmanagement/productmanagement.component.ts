import { Component } from '@angular/core';
import { SidebarComponent } from "../layouts/sidebar/sidebar.component";
import { HeaderComponent } from "../layouts/header/header.component";

@Component({
  selector: 'app-productmanagement',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent],
  templateUrl: './productmanagement.component.html',
  styleUrl: './productmanagement.component.css'
})
export class ProductmanagementComponent {

}
