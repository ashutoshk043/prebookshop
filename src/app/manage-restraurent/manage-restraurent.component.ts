import { Component } from '@angular/core';
import { SidebarComponent } from "../layouts/sidebar/sidebar.component";
import { HeaderComponent } from "../layouts/header/header.component";

@Component({
  selector: 'app-manage-restraurent',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent],
  templateUrl: './manage-restraurent.component.html',
  styleUrl: './manage-restraurent.component.css'
})
export class ManageRestraurentComponent {

}
