import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentRequest, PaymentCreateResponse } from './payment.models';
import { environment } from '../Environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiBaseURL}/Payment`; 

  constructor(private http: HttpClient) { }

  createPayment(request: PaymentRequest): Observable<PaymentCreateResponse> {
    return this.http.post<PaymentCreateResponse>(`${this.apiUrl}/create`, request, {
      withCredentials: true
    });
  }
} 