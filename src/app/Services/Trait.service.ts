import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../Environments/environment';
import { AddRetraiteDTO } from '../DTO/AddRetrait';
import { Retraite } from '../shared/Retraite';
import { RetraiteLightDto } from '../DTO/RetraiteLightDto';

@Injectable({
  providedIn: 'root'
})
export class RetraitesService {
  private baseUrl = `${environment.apiBaseURL}/Retraites`;

  constructor(private http: HttpClient) { }

  createRetraite(retraite: AddRetraiteDTO): Observable<any> {
    const token = localStorage.getItem('jwtToken');
  
    if (!token) {
      console.error('No token found in localStorage!');
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.post<any>(this.baseUrl, retraite, { headers });
  }


  getRetraites(): Observable<RetraiteLightDto[]> {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      throw new Error('No JWT token found in localStorage');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });

    return this.http.get<RetraiteLightDto[]>(this.baseUrl, { headers });
  }
  
// in RetraitesService
deleteRetraite(id: number): Observable<string> {
  const token = localStorage.getItem('jwtToken')!;
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  return this.http.delete(`${this.baseUrl}/${id}`, {
    headers,
    responseType: 'text'  // ← tell HttpClient to expect plain text
  });
}

  

    getRetraiteById(id: number): Observable<RetraiteLightDto> {
      const token = localStorage.getItem('jwtToken');
  
      if (!token) {
        throw new Error('No JWT token found in localStorage');
      }
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      });
  
      return this.http.get<RetraiteLightDto>(`${this.baseUrl}/${id}`, { headers });
    }
  
  
}
