import { Entreprise } from "./Entreprise";
import { Fournisseur } from "./Fournisseur";
import { Banque } from "./Banque";

export class Retraite {
  id: number = 0;
  montant: number = 0;
  numeroCheque: string = '';
  dateEcheance: Date = new Date();

  entrepriseId: number = 0;
  entreprise?: Entreprise;

  fournisseurs: Fournisseur[] = [];
  banques: Banque[] = [];

  getFormattedEcheance(): string {
    return this.dateEcheance.toLocaleDateString();
  }

  getTotalMontant(): string {
    return `${this.montant.toFixed(2)} TND`;
  }
}
