import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../Environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  private baseUrl = `${environment.apiBaseURL}/Auth`;  // /api/Auth

  constructor(private http: HttpClient) {}

  verifyCaptcha(token: string): Observable<any> {
    const body = { token };
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('jwtToken') || ''}`
    });

    // Use baseUrl + route "VerifyCaptcha"
    return this.http.post(`${this.baseUrl}/VerifyCaptcha`, body, { headers });
  }
}
