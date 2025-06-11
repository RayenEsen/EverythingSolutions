import { Component, EventEmitter, Output } from '@angular/core';
import { ThemeService } from '../Services/theme.service';
import { AuthService } from '../shared/Auth.service'; // <-- Import
import { Router } from '@angular/router'; // <-- Pour navigation après logout

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    public themeService: ThemeService,
    private authService: AuthService, 
    private router: Router 
  ) {}

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();

    if (this.themeService.isDarkMode()) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
    onToggleSidebar(): void {
      this.toggleSidebar.emit();
    }

    isProfileMenuOpen = false;

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']); 
    });
  }

}