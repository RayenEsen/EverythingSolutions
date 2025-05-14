import { Entreprise } from "./Entreprise";
import { Retraite } from "./Retraite";

export class Banque {
  id: number = 0;
  nom: string = "";
  adresse: string = ''; // Simplified address
  rib: string = '';

  // Relationship with Entreprise (one-to-many)
  entrepriseId: number = 0;


}
