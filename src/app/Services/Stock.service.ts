import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../shared/Stock';
import { environment } from '../Environments/environment';
import { AddStock } from '../DTO/AddStock';
import { StockGroupDto } from '../DTO/StockGroupDto';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiBaseURL = environment.apiBaseURL;

  constructor(private http: HttpClient) { }

  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiBaseURL}/Stocks`, { withCredentials: true });
  }

  getStock(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiBaseURL}/Stocks/${id}`, { withCredentials: true });
  }

  putStock(id: number, stock: Stock): Observable<any> {
    return this.http.put(`${this.apiBaseURL}/Stocks/${id}`, stock, { withCredentials: true });
  }

  postStock(stock: AddStock): Observable<Stock> {
    return this.http.post<Stock>(`${this.apiBaseURL}/Stocks`, stock, { withCredentials: true });
  }

  deleteStock(id: number): Observable<any> {
    return this.http.delete(`${this.apiBaseURL}/Stocks/${id}`, { withCredentials: true });
  }


  getStocksWithArticles(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiBaseURL}/Stocks/with-articles`, { withCredentials: true });
  }
}
