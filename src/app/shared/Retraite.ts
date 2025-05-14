import { Entreprise } from "./Entreprise";
import { Fournisseur } from "./Fournisseur";
import { Banque } from "./Banque";

export class Retraite {
  id: number = 0;
  montant: number | null = null;
  numeroCheque: string | null = null;
  dateEcheance: Date | null = null;

  // The new DateCreation property
  dateCreation: Date = new Date();  // Default to the current date

  // One-to-many relationship with Entreprise
  entrepriseId: number = 0;
  entreprise: Entreprise = new Entreprise();

  // One-to-one relationships
  banqueId: number | null = null;
  banque: Banque | null = null;

  fournisseurId: number | null = null;
  fournisseur: Fournisseur | null = null;

  // Helper methods
  getFormattedEcheance(): string {
    return this.dateEcheance ? this.dateEcheance.toLocaleDateString('fr-TN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) : 'N/A';
  }

  getTotalMontant(): string {
    return this.montant ? `${this.montant.toFixed(3)} TND` : '0.000 TND';
  }
}
