import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Banque } from './../shared/Banque';
import { environment } from './../Environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BanquesService {
  private baseUrl = `${environment.apiBaseURL}/Banques`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Banque[]> {
    return this.http.get<Banque[]>(this.baseUrl, {
      withCredentials: true
    });
  }

  getById(id: number): Observable<Banque> {
    return this.http.get<Banque>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  create(banque: Banque): Observable<Banque> {
    return this.http.post<Banque>(this.baseUrl, banque, {
      withCredentials: true
    });
  }

  update(id: number, banque: Banque): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, banque, {
      withCredentials: true
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }
}
