import { TVA } from '../shared/TVA';

export interface AddArticle {
  code: string;
  designation: string;
  prixAchatHT: number;
  tvaId: number | null; // Changed from 'tva: TVA'
  prixVenteHT: number;
  gouvernerat?: string; // New property for Gouvernerat
  stockId?: number; // Optionnel, comme dans le backend
}
