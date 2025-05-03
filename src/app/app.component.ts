import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // Import Router and NavigationEnd
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./Navbar/Navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { CommonModule } from '@angular/common';
import { AuthService } from './shared/Auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  isLoginPage = false;  // Make sure to declare isLoginPage at the top

  constructor(private authService: AuthService, private router: Router) {}  // Inject Router here

  ngOnInit() {
    // Subscribe to login status
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });

    // Subscribe to router events to check the current route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = this.router.url === '/login'; // Adjust route if needed
      }
    });
  }

  title = 'ES';
}
