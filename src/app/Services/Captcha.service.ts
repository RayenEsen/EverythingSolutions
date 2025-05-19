import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../Environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  private baseUrl = `${environment.apiBaseURL}/Auth`;

  constructor(private http: HttpClient) {}

  verifyCaptcha(token: string): Observable<any> {
    const body = { token };
    return this.http.post(`${this.baseUrl}/VerifyCaptcha`, body, {
      withCredentials: true
    });
  }
}
