import { TVA } from './TVA';
import { Stock } from './Stock';
import { Entreprise } from './Entreprise';
import { DevisArticle } from './DevisArticle';
// Removed import { DevisArticle } from './DevisArticle'; because the module cannot be found

export interface Article {
  id: number;
  code?: string;
  designation?: string;
  prixAchatHT: number;
  tvaId?: number;
  tva?: TVA;
  prixVenteHT: number;
  gouvernerat?: string;
  prixVenteTTC?: number | null; // Calculated automatically
  marge?: number | null; // Calculated automatically
  stockId?: number;
  stock?: Stock;
  entrepriseId: number;
  entreprise?: Entreprise;
  devisArticles?: DevisArticle[];
} 