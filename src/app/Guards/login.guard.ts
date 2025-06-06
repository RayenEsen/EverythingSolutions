import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../shared/Auth.service';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

canActivate(): Observable<boolean> {
  return this.authService.checkSession().pipe(
    tap(isAuth => {
      if (isAuth) {
        this.router.navigate(['/']);
      }
    }),
    map(isAuth => !isAuth)  // <-- return boolean to router
  );
}

}
