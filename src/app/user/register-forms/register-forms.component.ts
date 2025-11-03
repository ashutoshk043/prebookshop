import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';

@Component({
  selector: 'app-register-forms',
  standalone: true,
  imports: [SidebarComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register-forms.component.html',
  styleUrls: ['./register-forms.component.css']
})
export class RegisterFormsComponent {
  @Output() closeForm = new EventEmitter<any>();

  registerForm!: FormGroup;
  role: string = '';

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.createRegisterForm();
  }

  /** ✅ Create FormGroup with Nested Restaurant Group */
  createRegisterForm() {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        state: ['', Validators.required],
        district: ['', Validators.required],
        block: ['', Validators.required],
        status: ['', Validators.required],
        profileImage: [''],
        roleId: ['', Validators.required],

        restaurant: this.fb.group({
          restaurantName: [{ value: '', disabled: true }, Validators.required],
          restaurantType: [{ value: '', disabled: true }, Validators.required],
          restaurantAddress: [{ value: '', disabled: true }],
          pincode: [{ value: '', disabled: true }, [Validators.pattern(/^[1-9][0-9]{5}$/)]],
          latitude: [{ value: '', disabled: true }],
          longitude: [{ value: '', disabled: true }],
          fssaiNumber: [{ value: '', disabled: true }],
          gstNumber: [{ value: '', disabled: true }],
          panNumber: [{ value: '', disabled: true }],
          registrationDate: [{ value: '', disabled: true }],
          openingTime: [{ value: '', disabled: true }],
          closingTime: [{ value: '', disabled: true }],
          logoUrl: [{ value: '', disabled: true }],
          coverImageUrl: [{ value: '', disabled: true }],
          description: [{ value: '', disabled: true }],
          isVerified: [{ value: 'false', disabled: true }]
        })
      },
      { validators: this.passwordMatchValidator }
    );
  }

  /** ✅ Password Match Validator */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  }

  /** ✅ Handle Role Change */
  onRoleChange(event: any) {
    const selectedRole = event?.target?.value ?? event;
    this.role = selectedRole;
    this.registerForm.get('roleId')?.setValue(selectedRole);

    if (selectedRole === 'r6') {
      this.toggleRestaurantSection(true);
    } else {
      this.toggleRestaurantSection(false);
    }
  }

  /** ✅ Enable/Disable Restaurant Group */
  toggleRestaurantSection(enable: boolean) {
    const group = this.registerForm.get('restaurant') as FormGroup;
    if (!group) return;

    Object.keys(group.controls).forEach(key => {
      const control = group.controls[key];
      if (enable) control.enable();
      else {
        control.disable();
        control.reset('');
      }
    });
  }

  /** ✅ Mark All Controls as Touched */
  private markAllTouched(group: FormGroup) {
    Object.keys(group.controls).forEach(key => {
      const control = group.controls[key];
      if (control instanceof FormGroup) this.markAllTouched(control);
      else control.markAsTouched();
    });
  }

  /** ✅ On Submit */
  onSubmit() {
    if (this.registerForm.invalid) {
      this.markAllTouched(this.registerForm);
      console.warn('⚠️ Form invalid', this.registerForm.errors);
      return;
    }

    const payload = { ...this.registerForm.getRawValue() }; // include disabled controls
    if (this.role !== 'r6') delete payload.restaurant;

    console.log('✅ Register Payload:', payload);
  }

  /** ✅ Close Form */
  onClose() {
    this.closeForm.emit({ status: false });
  }

  /** ✅ Getters for Easy Access in Template */
  get f() {
    return this.registerForm.controls;
  }

  get r() {
    return (this.registerForm.get('restaurant') as FormGroup).controls;
  }
}
