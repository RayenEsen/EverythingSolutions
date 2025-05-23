import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = false;

  constructor() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      this.darkMode = JSON.parse(savedTheme);
    }
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.darkMode));
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }
}