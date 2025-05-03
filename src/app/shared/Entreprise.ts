import { Retraite } from "./Retraite";

export class Entreprise {
  id: number = 0;
  nomSociete: string = '';
  matriculeFiscale: string = '';
  ribBancaire: string = '';
  adresseEntreprise: string = '';
  email: string = '';
  telephone: string = '';
  password: string = '';

  // One-to-many relationship with Retraite
  retraites: Retraite[] = []; // A single entreprise can have multiple retraites
}
