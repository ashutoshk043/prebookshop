import { Component } from '@angular/core';
import { SidebarComponent } from "../layouts/sidebar/sidebar.component";
import { HeaderComponent } from "../layouts/header/header.component";

@Component({
  selector: 'app-ordermanagement',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent],
  templateUrl: './ordermanagement.component.html',
  styleUrl: './ordermanagement.component.css'
})
export class OrdermanagementComponent {

}
