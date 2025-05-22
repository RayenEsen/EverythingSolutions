import { Entreprise } from "./Entreprise";
import { Retraite } from "./Retraite";

export class Fournisseur {
  id: number = 0;
  nom: string | null = '';
  email: string | null = '';
  telephone: string | null = '';
  adresse: string | null = '';
  matriculeFournisseur: string  = ''; // ➕ Nouveau champ

  entrepriseId: number = 0;
}
