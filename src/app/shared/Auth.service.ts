import { Injectable } from '@angular/core';
import { environment } from '../Environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest } from '../DTO/LoginRequest';
import { LoginResponse } from '../DTO/LoginResponse';
import { RegisterRequest } from '../DTO/RegisterRequest';
import { jwtDecode } from 'jwt-decode';
import { throwError } from 'rxjs';
import { ResetPasswordRequest } from '../DTO/ResetPasswordRequest';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiBaseURL}/Auth`;

  // BehaviorSubject to track login state
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    const token = this.getToken();
    return !!token && token.trim() !== '';
  }
  register(data: RegisterRequest): Observable<any> {
    if (this.isAuthenticated()) {
      return throwError(() => new Error('User already registered'));
    }
  
    return this.http.post(`${this.baseUrl}/Register`, data);
  }
  
  resendVerification(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/ResendVerification`, { email }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'  // Correct content type for JSON payload
      })
    });
  }
  
  

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/Login`, data).pipe(
      tap((response: LoginResponse) => {
        if (response?.token && typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('jwtToken', response.token);
          this.loggedIn.next(true);
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('jwtToken');
      this.loggedIn.next(false);
    }
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('jwtToken');
    }
    return null;
  }

  getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getProtectedData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ProtectedEndpoint`, {
      headers: this.getHeaders()
    });
  }

  getDecodedToken(): { 
    id: number; 
    NomSociete: string; 
    email: string; 
    [key: string]: any 
  } | null {
    const token = this.getToken();
    if (!token) return null;
  
    try {
      const decoded: any = jwtDecode(token);
      
      // Extract ID from multiple possible claims
      const id = +decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
                 +decoded['EntrepriseId'] || 
                 +decoded['nameid'] || 
                 0;
      
      // Extract name from multiple possible claims
      const nomSociete = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
                        decoded['NomSociete'] || 
                        decoded['unique_name'] || 
                        '';
      
      // Extract email from multiple possible claims
      const email = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
                   decoded['email'] || 
                   '';
  
      return {
        id,
        NomSociete: nomSociete,
        email,
        ...decoded
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

    // Forgot password method
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/ForgotPassword`, { email });
  }

  // Reset password method
  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/ResetPassword`, data);
  }


}



// Note: The `tap` operator is used to perform side effects (like updating the BehaviorSubject) without modifying the observable stream.
// The `BehaviorSubject` is used to keep track of the login state and can be subscribed to in components to react to changes.
// The `isLoggedIn$` observable can be used in components to check if the user is logged in.
// The `hasToken` method checks if a token exists and is not empty.
// The `getHeaders` method constructs the headers for HTTP requests, including the authorization token if available.
// The `getProtectedData` method is an example of how to make a request to a protected endpoint using the authorization token.
// The `register` method is used to register a new user.
// The `login` method is used to log in a user and store the token in local storage.
// The `logout` method is used to log out a user and remove the token from local storage.
// The `isAuthenticated` method checks if the user is authenticated by checking for a valid token.
// The `getToken` method retrieves the token from local storage.