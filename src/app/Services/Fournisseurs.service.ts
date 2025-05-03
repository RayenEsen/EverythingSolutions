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

  constructor(private http: HttpClient) { }

  getAll(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(this.baseUrl);
  }

  getById(id: number): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`${this.baseUrl}/${id}`);
  }

  create(fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(this.baseUrl, fournisseur);
  }

  update(id: number, fournisseur: Fournisseur): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, fournisseur);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
