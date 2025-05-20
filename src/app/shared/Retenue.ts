import { Entreprise } from "./Entreprise";
import { Fournisseur } from "./Fournisseur";

export class Retenue {
  id: number = 0;
  numeroFacture: string = "";
  montantTTC: number = 0;
  type: string = "";
  dateCreation: Date = new Date();
  retenue: number = 0;
  montantNet: number = 0;

  // One-to-many relationship with Entreprise
  entrepriseId: number = 0;
  entreprise: Entreprise = new Entreprise();

  // One-to-one relationship with Fournisseur
  fournisseurId: number | null = null;
  fournisseur: Fournisseur | null = null;

  // Helper methods
  getFormattedDateCreation(): string {
    return this.dateCreation
      ? this.dateCreation.toLocaleDateString('fr-TN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : 'N/A';
  }

  getMontantNetFormatted(): string {
    return `${this.montantNet.toFixed(3)} TND`;
  }

  getRetenueFormatted(): string {
    return `${this.retenue.toFixed(3)} TND`;
  }
}
