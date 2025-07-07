export interface DevisArticleDto {
  articleId: number;
  quantite: number;
  remise: number; // Discount percentage on this article
}

export interface DevisCreateDto {
  code: string;
  devisArticles: DevisArticleDto[];
  clientId: number; // The selected client id for this devis
} 