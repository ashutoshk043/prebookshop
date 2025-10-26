import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { Router } from '@angular/router';

const LOGIN_RESTAURENT_USER = gql`
  mutation loginRestraurentuser($loginData: LoginRestaurantDto!) {
    loginRestraurentuser(loginData: $loginData) {
      token
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
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      // captcha: ['', Validators.required],
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

        console.log('Login Form:', this.loginForm.value);


    const { email, password, captcha } = this.loginForm.value;

    this.apollo
      .mutate({
        mutation: LOGIN_RESTAURENT_USER,
        variables: { loginData: { email, password, captcha } }
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          const token = res?.data?.loginRestraurentuser?.token;

          if (token) {
            localStorage.setItem('auth_token', token);
            this.toastr.success('Login successful!');
            this.router.navigate(['/home']); // navigate after login
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
