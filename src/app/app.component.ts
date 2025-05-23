import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // Import Router and NavigationEnd
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./footer/footer.component";
import { CommonModule } from '@angular/common';
import { AuthService } from './shared/Auth.service';
import { LayoutComponent } from './layout/layout.component';
import { ThemeService } from './Services/theme.service';
import { HostBinding } from '@angular/core';
import { NavbarComponent } from './navbar/navbarr.component';
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

  // Set initial theme
  this.updateBodyClass();
}


toggleDarkMode() {
  this.themeService.toggleDarkMode();
  this.updateBodyClass();
}

private updateBodyClass() {
  const isDark = this.themeService.isDarkMode();
  const body = document.body;

  if (isDark) {
    body.classList.add('dark');
  } else {
    body.classList.remove('dark');
  }
}

  

  title = 'ES';
}




