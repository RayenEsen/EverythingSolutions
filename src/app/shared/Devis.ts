// Devis model for frontend, matching backend structure
import { Entreprise } from './Entreprise';
import { DevisArticle } from './DevisArticle';

export class Devis {
  id: number = 0;
  entrepriseId: number = 0;
  entreprise?: Entreprise;
  code: string = '';
  dateCreation: Date = new Date();
  devisArticles: DevisArticle[] = [];

  // Not mapped: computed properties
  get totalHT(): number {
    return this.devisArticles?.reduce((sum, a) => sum + (a.mT_HTVA || 0), 0) ?? 0;
  }

  get totalTTC(): number {
    // Calculate TTC from HT + TVA (assuming 19% TVA rate)
    const totalHT = this.totalHT;
    return totalHT * 1.19;
  }
} 