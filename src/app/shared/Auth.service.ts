import { Injectable } from '@angular/core';
import { environment } from './../Environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, timer } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { LoginRequest } from '../DTO/LoginRequest';
import { LoginResponse } from '../DTO/LoginResponse';
import { RegisterRequest } from '../DTO/RegisterRequest';
import { ResetPasswordRequest } from '../DTO/ResetPasswordRequest';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiBaseURL}/Auth`;

  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();

  // Cache system
  private lastCheckTime = 0;
  private sessionCacheDuration = 10000; // 10 seconds

  constructor(private http: HttpClient) {
    this.checkSession().subscribe();
  }
checkSession(): Observable<boolean> {
  const now = Date.now();
  const isCacheValid = now - this.lastCheckTime < this.sessionCacheDuration;
  console.log('checkSession called. Cache valid?', isCacheValid);

  if (isCacheValid) {
    console.log('Returning cached loggedIn:', this.loggedIn.value);
    return of(this.loggedIn.value);
  }

  return this.http.get<{ isAuthenticated: boolean }>(`${this.baseUrl}/IsAuthenticated`, {
    withCredentials: true
  }).pipe(
    tap(response => {
      console.log('IsAuthenticated response:', response.isAuthenticated);
      this.loggedIn.next(response.isAuthenticated);
      this.lastCheckTime = Date.now();
    }),
    map(response => response.isAuthenticated),
    catchError(error => {
      console.error('IsAuthenticated check error:', error);
      this.loggedIn.next(false);
      this.lastCheckTime = Date.now();
      return of(false);
    })
  );
}


  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/Register`, data, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Register error', error);
        throw error;
      })
    );
  }

  resendVerification(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/ResendVerification`, { email }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Resend verification error', error);
        throw error;
      })
    );
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/Login`, data, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response?.entreprise) {
          localStorage.setItem('entrepriseInfo', JSON.stringify(response.entreprise));
          localStorage.setItem('employeeId', response.entreprise.id.toString());
        }
        this.loggedIn.next(true);
        this.lastCheckTime = Date.now();
      }),
      catchError(error => {
        console.error('Login error', error);
        this.loggedIn.next(false);
        throw error;
      })
    );
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/Logout`, {}, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.loggedIn.next(false);
        localStorage.removeItem('entrepriseInfo');
        this.lastCheckTime = 0;
      },
      error: error => {
        console.error('Logout error', error);
        this.loggedIn.next(false);
        localStorage.removeItem('entrepriseInfo');
        this.lastCheckTime = 0;
      }
    });
  }

  isAuthenticated(): boolean {
    return this.loggedIn.value;
  }

  getProtectedData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ProtectedEndpoint`, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Get protected data error', error);
        throw error;
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/ForgotPassword`, { email }, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Forgot password error', error);
        throw error;
      })
    );
  }

  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/ResetPassword`, data, {
      responseType: 'text' as 'json',
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Reset password error', error);
        throw error;
      })
    );
  }
}
