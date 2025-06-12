import { TVA } from './TVA';

export interface Article {
  id: number;
  code: string; // chiifre majuscule - numero - tiree
  designation: string;
  prixAchatHT: number;
  tva: TVA; // TVA (objet)
  prixVenteHT: number;
  gouvernerat?: string; // New property for Gouvernerat
  prixVenteTTC?: number; // Calculated automatically
  marge?: number; // Calculated automatically
  stockId?: number; // New property to link to a Stock
} 