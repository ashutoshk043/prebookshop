import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-restraurent-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-restraurent-form.component.html',
  styleUrl: './create-restraurent-form.component.css'
})
export class CreateRestraurentFormComponent {

  openForm:boolean = false


  openFormFromParent(status:any){
    if(status == 'add'){
      this.openForm = true
    }else{

    }
  }


  closeForm(){
    this.openForm = false
  }
}
