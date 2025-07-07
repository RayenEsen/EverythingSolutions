import { Article } from './Article';
import { Devis } from './Devis';

export interface DevisArticle {
  devisId: number;
  devis?: Devis;
  articleId: number;
  article?: Article;
  designation?: string;
  quantite: number;
  remise: number; // Pourcentage (ex: 10 = 10%)
  pU_HTVA?: number; // prix unitaire hors TVA
  mT_HTVA?: number; // montant hors TVA après remise
  // Computed properties (not mapped)
  puHTVA?: number; // prix unitaire hors TVA * Quantité
  mtHTVA?: number; // montant hors TVA après remise
} 