import { Component } from '@angular/core';
import { LayoutsModule } from "../layouts/layouts.module";
import { HeaderComponent } from "../layouts/header/header.component";

@Component({
  selector: 'app-varientmanagement',
  standalone: true,
  imports: [LayoutsModule, HeaderComponent],
  templateUrl: './varientmanagement.component.html',
  styleUrl: './varientmanagement.component.css'
})
export class VarientmanagementComponent {

}
