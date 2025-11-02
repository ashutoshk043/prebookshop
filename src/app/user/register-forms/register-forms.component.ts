import { Component, EventEmitter, Output, output } from '@angular/core';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-register-forms',
  standalone: true,
  imports: [SidebarComponent, CommonModule],
  templateUrl: './register-forms.component.html',
  styleUrl: './register-forms.component.css'
})
export class RegisterFormsComponent {
  @Output() closeForm = new EventEmitter<any>();
  role:string = ''
  registerForm = FormGroup


  constructor(private fb:FormBuilder){
    
  }

  ngOnInit(){
    this.createRegisterForm()
  }


  onClose(){
    this.closeForm.emit({status:false})
  }

onRoleChange(event: any) {
  console.log(event)
  this.role = event.target.value;
}


createRegisterForm(){
  // this.registerForm = this.fb.group({

  // })
}


}
