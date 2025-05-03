import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('jwtToken');
    if (token && token.trim() !== '') {
      this.router.navigate(['/']); // Redirect to home or dashboard
      return false;
    }
    return true;
  }
}
