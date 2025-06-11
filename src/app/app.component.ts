import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // Import Router and NavigationEnd
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./footer/footer.component";
import { CommonModule } from '@angular/common';
import { AuthService } from './shared/Auth.service';
import { LayoutComponent } from './layout/layout.component';
import { ThemeService } from './Services/theme.service';
import { HostBinding } from '@angular/core';
import { NavbarComponent } from './navbar/Navbar.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, LayoutComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  isLoginPage = false;  // Make sure to declare isLoginPage at the top

  constructor(private themeService: ThemeService , private authService: AuthService, private router: Router) {}  // Inject Router here

  goToPaymentInfo() {
    this.router.navigate(['/payment-info']);
  }

  ngOnInit() {
    // Subscribe to login status
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });

    // Subscribe to router events to check the current route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = this.router.url === '/login';
      }
    });
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  title = 'ES';
}




