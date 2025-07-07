export interface UpdateEntrepriseRequest {
  nomSociete: string;
  matriculeFiscale: string;
  adresseEntreprise: string;
  adresseComplete: string;
  telephone: string;
  siteWeb: string;
  logo?: File | Blob | null;
} 