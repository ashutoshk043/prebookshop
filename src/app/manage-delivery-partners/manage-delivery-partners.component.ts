import { Component } from '@angular/core';
import { SidebarComponent } from "../layouts/sidebar/sidebar.component";
import { HeaderComponent } from "../layouts/header/header.component";
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-manage-delivery-partners',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, SharedModule],
  templateUrl: './manage-delivery-partners.component.html',
  styleUrl: './manage-delivery-partners.component.css'
})
export class ManageDeliveryPartnersComponent {

}
