import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { registerLogoutHandler } from './app.config';
import { LoaderComponent } from './interceptor/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'front';

   constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Register logout handler
    registerLogoutHandler((message?: string) => {
      this.handleSessionExpired(message || 'Session expired');
    });
    
    // Listen for custom session expired event
    window.addEventListener('sessionExpired', ((event: CustomEvent) => {
      this.handleSessionExpired(event.detail.message);
    }) as EventListener);
  }
  
  private handleSessionExpired(message: string): void {
    console.log('Session expired:', message);
    
    // Show toast message
    this.toastr.error(message, 'Session Expired');
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate to login page after delay
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1500);
  }
}
