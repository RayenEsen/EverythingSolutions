import { Entreprise } from "./Entreprise";
import { Fournisseur } from "./Fournisseur";
import { Banque } from "./Banque";

export class Retraite {
  id: number = 0;
  montant: number | null = null;
  numeroCheque: string | null = null;
  dateEcheance: Date | null = null;

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
    return this.dateEcheance ? this.dateEcheance.toLocaleDateString() : 'N/A';
  }

  getTotalMontant(): string {
    return this.montant ? `${this.montant.toFixed(2)} TND` : '0.00 TND';
  }
}