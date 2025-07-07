import { Injectable } from '@angular/core';
import { environment } from './../Environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, timer } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { LoginRequest } from '../DTO/LoginRequest';
import { LoginResponse } from '../DTO/LoginResponse';
import { RegisterRequest } from '../DTO/RegisterRequest';
import { ResetPasswordRequest } from '../DTO/ResetPasswordRequest';
import { EntreprisesProgress } from '../DTO/EntreprisesProgress';
import { EntrepriseDetailsDto } from '../DTO/EntrepriseDetailsDto';
import { UpdateEntrepriseRequest } from '../DTO/UpdateEntrepriseRequest';
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
        // Store only the entreprise object
        localStorage.setItem('entrepriseInfo', JSON.stringify(response.entreprise));
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


logout(): Observable<any> {
  return this.http.post(`${this.baseUrl}/Logout`, {}, {
    withCredentials: true
  }).pipe(
    tap(() => {
      this.loggedIn.next(false);
      localStorage.removeItem('entrepriseInfo');
      this.lastCheckTime = 0;
    }),
    catchError(error => {
      console.error('Logout error', error);
      this.loggedIn.next(false);
      localStorage.removeItem('entrepriseInfo');
      this.lastCheckTime = 0;
      return of(null);
    })
  );
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


  // Get entreprise by id
getEntrepriseById(entrepriseId: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/entreprise/${entrepriseId}`, {
    withCredentials: true
  }).pipe(
    catchError(error => {
      console.error('Get entreprise error', error);
      throw error;
    })
  );
}

// Update entreprise by id
updateEntreprise(entrepriseId: number, data: UpdateEntrepriseRequest | FormData): Observable<any> {
  let formData: FormData;
  if (data instanceof FormData) {
    formData = data;
  } else {
    formData = new FormData();
    formData.append('NomSociete', data.nomSociete);
    formData.append('MatriculeFiscale', data.matriculeFiscale);
    formData.append('AdresseEntreprise', data.adresseEntreprise);
    formData.append('AdresseComplete', data.adresseComplete);
    formData.append('Telephone', data.telephone);
    formData.append('SiteWeb', data.siteWeb || '');
    if (data.logo) {
      formData.append('Logo', data.logo);
    }
  }
  return this.http.put<any>(`${this.baseUrl}/entreprise/${entrepriseId}`, formData, {
    withCredentials: true
  }).pipe(
    catchError(error => {
      console.error('Update entreprise error', error);
      throw error;
    })
  );
}

// Get light list of entreprises
getEntreprisesLight(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/light`, {
    withCredentials: true
  }).pipe(
    catchError(error => {
      console.error('Get entreprises light error', error);
      return of([]); // Return empty list on error
    })
  );
}
  // Get entreprise info from local storage
  getEntrepriseInfo(): any {
    const entrepriseInfo = localStorage.getItem('entrepriseInfo');
    return entrepriseInfo ? JSON.parse(entrepriseInfo) : null;
  }

  // Clear entreprise info from local storage
  clearEntrepriseInfo(): void {
    localStorage.removeItem('entrepriseInfo');
  }

// Inside AuthService
getStatsByGouvernorat(): Observable<{ gouvernorat: string, count: number }[]> {
  const url = `${environment.apiBaseURL}/Auth/stats/by-gouvernorat`;
  return this.http.get<{ gouvernorat: string, count: number }[]>(url, {
    withCredentials: true
  }).pipe(
    catchError(error => {
      console.error('Error fetching stats by gouvernorat', error);
      return of([]); // fallback to empty list
    })
  );
}


// Delete entreprise by id
deleteEntreprise(entrepriseId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/entreprise/${entrepriseId}`, {
    withCredentials: true
  }).pipe(
    catchError(error => {
      console.error('Delete entreprise error', error);
      throw error;
    })
  );
}




getEntreprisesProgress(): Observable<EntreprisesProgress> {
  return this.http.get<EntreprisesProgress>(`${environment.apiBaseURL}/Auth/entreprises/progress`, {
    withCredentials: true
  }).pipe(
    catchError(error => {
      console.error('Error fetching entreprises progress', error);
      throw error;
    })
  );
}

getEntreprisesCreatedTodayCount(): Observable<{ count: number }> {
  return this.http.get<{ count: number }>(`${environment.apiBaseURL}/Auth/entreprises/created-today/count`, {
    withCredentials: true
  }).pipe(
    catchError(error => {
      console.error('Error fetching entreprises created today count', error);
      throw error;
    })
  );
}

// Get entreprise details by id
getEntrepriseDetails(id: number): Observable<EntrepriseDetailsDto> {
  return this.http.get<EntrepriseDetailsDto>(`${this.baseUrl}/${id}/details`, {
    withCredentials: true
  }).pipe(
    catchError(error => {
      console.error('Get entreprise details error', error);
      throw error;
    })
  );
}

}
