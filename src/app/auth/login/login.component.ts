import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { Router } from '@angular/router';
import { LOGIN_RESTAURENT_USER } from '../../graphql/authManagement/login.mutation';



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
  ) { }

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
    const { email, password, remember } = this.loginForm.value;

    this.apollo.mutate({
      mutation: LOGIN_RESTAURENT_USER,
      variables: { loginData: { email, password } },
      context: { operationName: 'loginRestraurent' }
    }).subscribe({
      next: (res: any) => {
        this.loading = false;

        const response = res?.data?.loginRestraurent;

        const accessToken = response?.accessToken;   // ✅ correct
        const refreshToken = response?.refreshToken; // ✅ correct
        const userProfile = response?.userProfile;

        if (!accessToken || !refreshToken) {
          this.toastr.error('Invalid login response');
          return;
        }

        // 🔐 Store tokens
        if (remember) {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
        } else {
          sessionStorage.setItem('access_token', accessToken);
          sessionStorage.setItem('refresh_token', refreshToken);
        }

        // 👤 Store user profile (UI purpose only)
        localStorage.setItem('user_profile', JSON.stringify(userProfile));

        console.log('🟢 Access Token:', accessToken);
        console.log('🔁 Refresh Token:', refreshToken);

        this.toastr.success('Login successful!');
        this.router.navigate(['/home']);
      },

      error: (err) => {
        this.loading = false;
        this.toastr.error(err.message || 'Login failed');
        console.error('GraphQL Error:', err);
      }
    });
  }


}
