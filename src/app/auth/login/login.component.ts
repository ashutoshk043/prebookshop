import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

const LOGIN_RESTAURENT_USER = gql`
  mutation loginRestraurent($loginData: RestraurentLoginDTO!) {
    loginRestraurent(loginData: $loginData) {
      token
      userProfile {
        name
        email
        phone
        state
        district
        block
        village
        roleId
        profile
        status
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
    private cookieService: CookieService
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

    this.apollo.mutate({
      mutation: LOGIN_RESTAURENT_USER,
      variables: { loginData: { email, password } }
    })
    .subscribe({
      next: (res: any) => {
        this.loading = false;

        // ❗ IMPORTANT: your backend returns: loginRestraurent
        const response = res?.data?.loginRestraurent;

        const token = response?.token;
        const userDetails = response?.userProfile;

        console.log("🔥 Full Response:", response);

        if (token) {
          // Cookie expire time
          const expireDays = this.loginForm.value.remember ? 7 : 1;

          // Save token in cookie
          this.cookieService.set('auth_token', token, expireDays, '/', '', false, 'Strict');

          console.log("🟢 Saved restaurant details:", userDetails);

          // Redirect
          this.router.navigate(['/home']);
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
