import { HttpClient } from '@angular/common/http';
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

  constructor(private http: HttpClient) {}

  createRetraite(retraite: AddRetraiteDTO): Observable<any> {
    return this.http.post<any>(this.baseUrl, retraite, {
      withCredentials: true
    });
  }

  getRetraites(): Observable<RetraiteLightDto[]> {
    return this.http.get<RetraiteLightDto[]>(this.baseUrl, {
      withCredentials: true
    });
  }

  deleteRetraite(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      withCredentials: true,
      responseType: 'text'
    });
  }

  getRetraiteById(id: number): Observable<RetraiteLightDto> {
    return this.http.get<RetraiteLightDto>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  deleteRetraites(ids: number[]): Observable<string> {
  return this.http.post(`${this.baseUrl}/batch-delete`, ids, {
    withCredentials: true,
    responseType: 'text'
  });
}

updateRetraite(id: number, retraite: AddRetraiteDTO): Observable<RetraiteLightDto> {
  return this.http.put<RetraiteLightDto>(`${this.baseUrl}/${id}`, retraite, {
    withCredentials: true
  });
}

 getRetraitesProgress(): Observable<{ countThisMonth: number; countLastMonth: number; growth: number }> {
    return this.http.get<{ countThisMonth: number; countLastMonth: number; growth: number }>(`${this.baseUrl}/progress`, {
      withCredentials: true
    });
  }

  getRetraitesCreatedTodayCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/created-today/count`, {
      withCredentials: true
    });
  }

  
getMonthlySummary(): Observable<{ year: number, month: number, count: number }[]> {
  return this.http.get<{ year: number, month: number, count: number }[]>(
    `${this.baseUrl}/monthly-summary`,
    { withCredentials: true }
  );
}

  
}
