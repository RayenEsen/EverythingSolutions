import { Injectable } from '@angular/core';
import { environment } from '../Environments/environment.development';
import { LoginRequest } from '../Interfaces/LoginRequest';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Entreprise } from './Entreprise';
import { LoginResponse } from '../Interfaces/LoginResponse';  // Import the interface
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';  // Import `tap` from `rxjs/operators`

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
      tap((response: LoginResponse) => {  // Add type to response
        if (response?.token) {
          // Store token in localStorage
          localStorage.setItem('jwtToken', response.token);
        }
      })
    );
  }

  // Retrieve the stored JWT token (for use in headers)
  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  // Check if the user is authenticated by checking if a token exists
  isAuthenticated(): boolean {
    return !!this.getToken(); // Returns true or false
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
}
// This service handles authentication, including login, registration, and token management.
// It uses HttpClient to make HTTP requests and stores the JWT token in localStorage.
// The `login` method also uses the `tap` operator to store the token upon successful login.
// The `getHeaders` method prepares the headers for authenticated requests.
// The `isAuthenticated` method checks if the user is logged in by verifying the presence of a token.
// The `getProtectedData` method is an example of how to make a request to a protected endpoint using the stored token.
// The `register` method allows for user registration by sending a POST request with the user's data.
// The `LoginRequest` and `LoginResponse` interfaces define the structure of the request and response objects.
// The `Entreprise` interface is used for the registration data.
// The `environment` object contains the base URL for the API, which is used to construct the full endpoint URLs. 