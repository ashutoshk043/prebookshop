import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;

  // GraphQL mutation
  CREATE_RESTAURANT = gql`
    mutation createRestaurant($input: CreateRestaurantDto!) {
      createRestaurant(createRestaurantDto: $input) {
        _id
        name
        type
        city
        verifiedBy {
          userId
          role
          verifiedAt
          remarks
        }
      }
    }
  `;

  constructor(private fb: FormBuilder, private apollo: Apollo) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      restaurantName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator for password matching
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.valid) {
      const formValues = this.registerForm.value;

      const input = {
        name: formValues.restaurantName,
        ownerName: `${formValues.firstName} ${formValues.lastName}`,
        type: 'RESTAURANT',
        phone: formValues.phone,
        email: formValues.email,
        address: formValues.address,
        city: 'Delhi',        // Hardcoded or get from form
        state: 'Delhi',       // Hardcoded or get from form
        pincode: '110001',    // Hardcoded or get from form
        latitude: '28.6139',
        longitude: '77.2090',
        fssaiNumber: 'FSSAI12345',
        gstNumber: 'GSTIN12345',
        panNumber: 'PAN12345',
        registrationDate: new Date().toISOString(),
        openingTime: '09:00',
        closingTime: '22:00',
        isOpen: true,
        rating: 0,
        totalOrders: 0,
        logoUrl: '',
        coverImageUrl: '',
        description: '',
        isVerified: false,
        createdBy: 'admin'
      };

      this.apollo.mutate({
        mutation: this.CREATE_RESTAURANT,
        variables: { input }
      }).subscribe({
        next: (res) => {
          console.log('Restaurant created:', res.data);
          alert('Restaurant registered successfully!');
          this.registerForm.reset();
          this.submitted = false;
        },
        error: (err) => {
          console.error('Error creating restaurant:', err);
          alert('Failed to register restaurant');
        }
      });

    } else {
      console.log('Form is invalid');
      this.registerForm.markAllAsTouched();
    }
  }

  // Convenience getter for template
  get f() {
    return this.registerForm.controls;
  }
}
