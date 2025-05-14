import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Banque } from './../shared/Banque';
import { environment } from './../Environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BanquesService {
  private baseUrl = `${environment.apiBaseURL}/Banques`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAll(): Observable<Banque[]> {
    return this.http.get<Banque[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getById(id: number): Observable<Banque> {
    return this.http.get<Banque>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  create(banque: Banque): Observable<Banque> {
    return this.http.post<Banque>(this.baseUrl, banque, {
      headers: this.getAuthHeaders()
    });
  }

  update(id: number, banque: Banque): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, banque, {
      headers: this.getAuthHeaders()
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
