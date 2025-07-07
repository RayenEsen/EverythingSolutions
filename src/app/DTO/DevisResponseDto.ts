import { ClientInfoDto } from './ClientInfoDto';

export interface DevisArticleWithDetailsDto {
  devisId: number;
  articleId: number;
  designation: string;
  quantite: number;
  remise: number;
  pU_HTVA: number;
  mT_HTVA: number;
}

export interface DevisWithArticlesDto {
  id: number;
  entrepriseId: number;
  clientId: number; // ID du client associé au devis
  clientName: string;
  clientCode: string; // ✅ Nouveau champ
  code: string;
  dateCreation: string; // Use string for ISO date in TS
  devisArticles: DevisArticleWithDetailsDto[];
}

export class DevisArticleDetailDto {
    codeArticle: string = '';
    designation: string = '';
    prixUnitaireHT: number = 0;
    quantite: number = 0;
    remise: number = 0; // in percentage
    tauxTVA: number = 0; // in percentage
    montantHT: number = 0;
    montantTVA: number = 0;
    montantTTC: number = 0;
}

export interface DevisWithCompanyInfoDto {
    // Company Information
    nomSociete: string;
    adresseEntreprise: string;
    matriculeFiscale: string;
    email: string;
    telephone: string;
    imageUrl: string; // camelCase for TypeScript
    siteWeb: string;

    // Devis Information
    code: string;
    dateCreation: string; // ISO string for DateTime

    // Articles Information
    articles: DevisArticleDetailDto[];

    // Totals
    totalHT: number;
    totalTVA: number;
    totalTTC: number;
    
    // Client Information
    client: ClientInfoDto;
} 