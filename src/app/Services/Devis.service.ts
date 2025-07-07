import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { Devis } from '../shared/Devis';
import { DevisCreateDto } from '../DTO/DevisCreateDto';
import { DevisUpdateDto } from '../DTO/DevisUpdateDto';
import { DevisWithArticlesDto, DevisWithCompanyInfoDto } from '../DTO/DevisResponseDto';
import { environment } from '../Environments/environment';

@Injectable({ providedIn: 'root' })
export class DevisService {
  private baseUrl = `${environment.apiBaseURL}/Devis`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<DevisWithArticlesDto[]> {
    return this.http.get<DevisWithArticlesDto[]>(this.baseUrl, { withCredentials: true });
  }

  getById(id: number): Observable<DevisWithArticlesDto> {
    return this.http.get<DevisWithArticlesDto>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  create(dto: DevisCreateDto): Observable<DevisWithArticlesDto> {
    return this.http.post<DevisWithArticlesDto>(this.baseUrl, dto, { withCredentials: true });
  }

  update(id: number, dto: DevisUpdateDto): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}`, dto, { 
      withCredentials: true,
      responseType: 'text'
    }).pipe(
      tap(response => console.log('Update response:', response)),
      catchError(error => {
        console.error('Update error:', error);
        throw error;
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  getStats(): Observable<{ TotalDevis: number; TotalHT: number; TotalTTC: number }> {
    return this.http.get<{ TotalDevis: number; TotalHT: number; TotalTTC: number }>(`${this.baseUrl}/stats`, { withCredentials: true });
  }

  getWithCompanyInfoById(id: number): Observable<DevisWithCompanyInfoDto> {
    return this.http.get<DevisWithCompanyInfoDto>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }
} 