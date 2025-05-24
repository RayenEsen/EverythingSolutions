import { Component, EventEmitter, Output } from '@angular/core';
import { ThemeService } from '../Services/theme.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(public themeService: ThemeService) {}

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

}