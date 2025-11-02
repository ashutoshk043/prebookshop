import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

const LOGIN_RESTAURENT_USER = gql`
  mutation loginRestraurentuser($loginData: LoginRestaurantDto!) {
    loginRestraurentuser(loginData: $loginData) {
      token
      restaurantProfile {
        name
        ownerName
        type
        phone
        email
        address
        city
        state
        pincode
        latitude
        longitude
        fssaiNumber
        gstNumber
        panNumber
        registrationDate
        openingTime
        closingTime
        isOpen
        rating
        totalOrders
        logoUrl
        coverImageUrl
        description
        isVerified
      }
    }
  }
`;


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastrModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private toastr: ToastrService,
    private router: Router,
    private cookieService: CookieService // ✅ Inject CookieService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });

    console.log('Login Form Initialized:', this.loginForm.value);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.toastr.error('Please fill all required fields!');
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.apollo
      .mutate({
        mutation: LOGIN_RESTAURENT_USER,
        variables: { loginData: { email, password } }
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          const token = res?.data?.loginRestraurentuser?.token;
          const restDetails = res?.data?.loginRestraurentuser?.restaurantProfile

          if (token) {
            // ✅ Store JWT token in cookies instead of localStorage
            const expireDays = this.loginForm.value.remember ? 7 : 1;
            this.cookieService.set('auth_token', token, expireDays, '/', '', false, 'Strict');

            console.log(restDetails, "restDetails")

            // if(!restDetails.isVerified){
            //     this.router.navigate(['/restaurent-profile']);
            // }else{
              this.router.navigate(['/home']);
            // }

            this.toastr.success('Login successful!');
            
          } else {
            this.toastr.error('Invalid login credentials');
          }
        },
        error: (err) => {
          this.loading = false;
          this.toastr.error(err.message || 'Login failed');
          console.error('GraphQL Error:', err);
        }
      });
  }
}
