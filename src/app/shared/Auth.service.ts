import { Injectable } from '@angular/core';
import { environment } from '../Environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Entreprise } from './Entreprise';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest } from '../DTO/LoginRequest';
import { LoginResponse } from '../DTO/LoginResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${environment.apiBaseURL}/Auth`;

  constructor(private http: HttpClient) {}

  register(data: Entreprise): Observable<any> {
    return this.http.post(`${this.baseUrl}/Register`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/Login`, data).pipe(
      tap((response: LoginResponse) => {
        if (response?.token) {
          // Store token in localStorage, but check if window is available
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('jwtToken', response.token);
            
          }
        }
      })
    );
  }

  // Retrieve the stored JWT token (for use in headers)
  getToken(): string | null {
    // Check if window is available (i.e., in the browser)
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('jwtToken');
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && token !== ''; // Explicit check for null and empty string
  }
  

  // Add JWT to headers for future requests
  getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Example protected API request
  getProtectedData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ProtectedEndpoint`, {
      headers: this.getHeaders()
    });
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('jwtToken');
      alert('Token removed'); // Test if this line is being executed
    }
  }
  
}
// This service handles authentication-related tasks such as login, registration, and token management.
// It uses Angular's HttpClient to make HTTP requests to the backend API.
// The service also manages the JWT token, storing it in localStorage and attaching it to HTTP headers for protected routes.            
// The `isAuthenticated` method checks if the user is logged in by verifying the presence of a token.
// The `getProtectedData` method is an example of how to make a request to a protected endpoint using the stored token.
// The `tap` operator is used to perform side effects, such as storing the token in localStorage after a successful login.
// The `getHeaders` method constructs the headers for HTTP requests, including the JWT token for authorization.
// The `register` method allows new users to register by sending their data to the backend.
// The `login` method sends the login credentials to the backend and handles the response, including storing the JWT token.
// The `logout` method removes the token from localStorage, effectively logging the user out.
// The `getToken` method retrieves the stored JWT token from localStorage.