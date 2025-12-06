import { Component } from '@angular/core';
import { SidebarComponent } from "../layouts/sidebar/sidebar.component";
import { HeaderComponent } from "../layouts/header/header.component";

@Component({
  selector: 'app-manage-delivery-partners',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent],
  templateUrl: './manage-delivery-partners.component.html',
  styleUrl: './manage-delivery-partners.component.css'
})
export class ManageDeliveryPartnersComponent {

}
