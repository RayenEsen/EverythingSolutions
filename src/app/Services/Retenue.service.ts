import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../Environments/environment';
import { RetenueDto } from '../DTO/RetenueDto';
import { AddRetenueDTO } from '../DTO/AddRetenue';
import { CountResponse, RetenuesProgress } from '../DTO/RetenuesProgress';
@Injectable({
  providedIn: 'root'
})
export class RetenuesService {
  private baseUrl = `${environment.apiBaseURL}/Retenues`;

  constructor(private http: HttpClient) {}

  createRetenue(retenue: AddRetenueDTO): Observable<any> {
    return this.http.post<any>(this.baseUrl, retenue, {
      withCredentials: true
    });
  }

  getRetenues(): Observable<RetenueDto[]> {
    return this.http.get<RetenueDto[]>(this.baseUrl, {
      withCredentials: true
    });
  }

  getRetenueById(id: number): Observable<RetenueDto> {
    return this.http.get<RetenueDto>(`${this.baseUrl}/${id}`, {
      withCredentials: true
    });
  }

  updateRetenue(id: number, retenue: RetenueDto): Observable<RetenueDto> {
    return this.http.put<RetenueDto>(`${this.baseUrl}/${id}`, retenue, {
      withCredentials: true
    });
  }

  

  deleteRetenue(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      withCredentials: true,
      responseType: 'text'
    });
  }

  deleteRetenues(ids: number[]): Observable<string> {
    return this.http.post(`${this.baseUrl}/batch-delete`, ids, {
      withCredentials: true,
      responseType: 'text'
    });
  }


  getRetenuesProgress(): Observable<RetenuesProgress> {
  return this.http.get<RetenuesProgress>(`${this.baseUrl}/progress`, {
    withCredentials: true
  });
}

getRetenuesCreatedTodayCount(): Observable<CountResponse> {
  return this.http.get<CountResponse>(`${this.baseUrl}/created-today/count`, {
    withCredentials: true
  });
}


}
