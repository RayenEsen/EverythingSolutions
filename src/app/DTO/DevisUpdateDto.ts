import { DevisArticleDto } from './DevisCreateDto';

export interface DevisUpdateDto {
  code: string;
  devisArticles: DevisArticleDto[];
  clientId: number;
  clientName?: string;
} 