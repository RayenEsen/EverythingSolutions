import { TVA } from '../shared/TVA';

export interface AddArticle {
  code: string;
  designation: string;
  prixAchatHT: number;
  tva: TVA; // Assuming TVA is selected/input as an object
  prixVenteHT: number;
} 