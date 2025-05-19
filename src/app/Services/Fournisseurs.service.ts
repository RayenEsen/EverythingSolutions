import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fournisseur } from './../shared/Fournisseur';
import { environment } from './../Environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FournisseurService {
  private baseUrl = `${environment.apiBaseURL}/Fournisseurs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(this.baseUrl, {
      withCredentials: true
    });
  }

  getById(id: number): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  create(fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(this.baseUrl, fournisseur, {
      withCredentials: true
    });
  }

  update(id: number, fournisseur: Fournisseur): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, fournisseur, {
      withCredentials: true
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }
}
