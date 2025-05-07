
import { Adresse } from "./Adresse";
export class Banque {
    id: number = 0;
    nom: string = '';

    adresses: Adresse[] = []; // Relation many-to-many
  }