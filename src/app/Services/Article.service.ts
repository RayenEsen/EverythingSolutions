import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '../shared/Article';
import { AddArticle } from '../DTO/AddArticle';
import { environment } from '../Environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private apiUrl = `${environment.apiBaseURL}/Articles`;

  constructor(private http: HttpClient) { }

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl, { withCredentials: true });
  }

  addArticle(article: AddArticle): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, article, { withCredentials: true });
  }

  updateArticle(id: number, article: AddArticle): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, article, { withCredentials: true });
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

}
