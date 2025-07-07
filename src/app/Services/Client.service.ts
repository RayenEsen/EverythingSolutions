import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../shared/Client';
import { environment } from '../Environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiBaseURL}/Clients`;

  constructor(private http: HttpClient) { }

  // Get all clients
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl, { withCredentials: true });
  }

  // Get a specific client by ID
  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  // Create a new client
  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client, { withCredentials: true });
  }

  // Update an existing client
  updateClient(id: number, client: Client): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, client, { withCredentials: true });
  }

  // Delete a client
  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  // Get clients by entreprise
  getClientsByEntreprise(entrepriseId: number): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}?entrepriseId=${entrepriseId}`, { withCredentials: true });
  }
} 