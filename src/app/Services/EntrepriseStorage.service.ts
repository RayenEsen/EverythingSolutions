import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EntrepriseStorageService {
  private getEntreprise(): any {
    return JSON.parse(localStorage.getItem('entreprise') || '{}');
  }

  getNom(): string {
    return this.getEntreprise().nomSociete || '';
  }

  getImageUrl(): string {
    return this.getEntreprise().imageUrl || '';
  }

  getEmail(): string {
    return this.getEntreprise().email || '';
  }

  getTelephone(): string {
    return this.getEntreprise().telephone || '';
  }

  getId(): number {
    return this.getEntreprise().id || 0;
  }

  getAll(): any {
    return this.getEntreprise();
  }
} 