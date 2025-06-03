import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const entrepriseInfoStr = localStorage.getItem('entrepriseInfo');

    if (entrepriseInfoStr) {
      try {
        const entrepriseInfo = JSON.parse(entrepriseInfoStr);
        const isAdmin = entrepriseInfo.isAdmin === true;

        if (isAdmin) {
          return true;
        }
      } catch (error) {
        // Parsing error, treat as not admin
        console.error('Error parsing entrepriseInfo from localStorage', error);
      }
    }

    // Not admin or no info, redirect to home
    return this.router.parseUrl('/home');
  }
}
