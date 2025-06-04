import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = false;
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      this.darkMode = JSON.parse(savedTheme);
      this.darkModeSubject.next(this.darkMode);
      this.applyTheme(this.darkMode);
    }

    // Check system preference if no saved preference
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.darkMode = prefersDark.matches;
      this.darkModeSubject.next(this.darkMode);
      this.applyTheme(this.darkMode);

      // Listen for system theme changes
      prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('darkMode')) {
          this.darkMode = e.matches;
          this.darkModeSubject.next(this.darkMode);
          this.applyTheme(this.darkMode);
        }
      });
    }
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    this.darkModeSubject.next(this.darkMode);
    localStorage.setItem('darkMode', JSON.stringify(this.darkMode));
    this.applyTheme(this.darkMode);
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }

  private applyTheme(isDark: boolean): void {
    const html = document.querySelector('html');
    if (isDark) {
      html?.classList.add('dark-mode');
      document.body.classList.add('dark');
    } else {
      html?.classList.remove('dark-mode');
      document.body.classList.remove('dark');
    }
  }
}