import { Component } from '@angular/core';
import { SidebarComponent } from "../layouts/sidebar/sidebar.component";
import { HeaderComponent } from "../layouts/header/header.component";
import { RegisterFormsComponent } from "./register-forms/register-forms.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, RegisterFormsComponent,CommonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
showForm:boolean = false


openRegisterForm(status:boolean){
this.showForm = status
}

closeFormClicked(event:any){
  this.openRegisterForm(event.status)
}
}
