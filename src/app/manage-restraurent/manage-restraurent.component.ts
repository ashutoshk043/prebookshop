import { Component, ViewChild } from '@angular/core';
import { SidebarComponent } from "../layouts/sidebar/sidebar.component";
import { HeaderComponent } from "../layouts/header/header.component";
import { SharedModule } from '../shared/shared.module';
import { CreateRestraurentFormComponent } from '../shared/create-restraurent-form/create-restraurent-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-restraurent',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, SharedModule, CommonModule],
  templateUrl: './manage-restraurent.component.html',
  styleUrl: './manage-restraurent.component.css'
})
export class ManageRestraurentComponent {

  @ViewChild(CreateRestraurentFormComponent)
  child!: CreateRestraurentFormComponent;

  openFormStatus:boolean=false

  openForm(openType: any) {
    this.openFormStatus =true
    // alert(openType);

    // Child function call example (optional)
    this.child.openFormFromParent(openType);
  }

}
