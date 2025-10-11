import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentUrl: string = '';
  currentRoute: string = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Listen for route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects;
        this.extractRouteName();
      });

    // Also set initially
    this.currentUrl = this.router.url;
    this.extractRouteName();
  }

  extractRouteName() {
    // You can customize this logic as per your route pattern
    const parts = this.currentUrl.split('/');
    this.currentRoute = parts[parts.length - 1] == 'home' ? 'Dashboard' : parts[parts.length - 1];
  }
}
