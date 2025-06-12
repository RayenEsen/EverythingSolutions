import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TVA } from '../shared/TVA';
import { environment } from '../Environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TVAService {
  private apiBaseURL = environment.apiBaseURL;

  constructor(private http: HttpClient) { }

  getTVAs(): Observable<TVA[]> {
    return this.http.get<TVA[]>(`${this.apiBaseURL}/TVAs`, { withCredentials: true });
  }

  getTVA(id: number): Observable<TVA> {
    return this.http.get<TVA>(`${this.apiBaseURL}/TVAs/${id}`, { withCredentials: true });
  }

  putTVA(id: number, tva: TVA): Observable<any> {
    return this.http.put(`${this.apiBaseURL}/TVAs/${id}`, tva, { withCredentials: true });
  }

  postTVA(tva: TVA): Observable<TVA> {
    return this.http.post<TVA>(`${this.apiBaseURL}/TVAs`, tva, { withCredentials: true });
  }

  deleteTVA(id: number): Observable<any> {
    return this.http.delete(`${this.apiBaseURL}/TVAs/${id}`, { withCredentials: true });
  }
}
