import { Entreprise } from "./Entreprise";
import { Retraite } from "./Retraite";

export class Fournisseur {
  id: number = 0;
  nom: string | null = '';
  email: string | null = '';
  telephone: string | null = '';
  adresse: string | null = '';

  // One-to-many relationship with Entreprise
  entrepriseId: number = 0;

}
