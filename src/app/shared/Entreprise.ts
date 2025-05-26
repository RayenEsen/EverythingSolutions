import { Retraite } from "./Retraite";
import { Fournisseur } from "./Fournisseur";
import { Banque } from "./Banque";

export class Entreprise {
  id: number = 0;
  nomSociete: string = '';
  matriculeFiscale: string = '';
  ribBancaire: string = '';
  adresseEntreprise: string = '';
  adresseComplete: string = ''; // Added to match backend
  email: string = '';
  telephone: string = '';
  password: string = '';

  // Additional properties
  emailConfirmed: boolean = false;
  verificationToken: string | null = null;
  passwordResetToken: string | null = null;
  resetTokenExpiration: Date | null = null;

  // One-to-many relationships
  retraites: Retraite[] | null = [];
  fournisseurs: Fournisseur[] | null = [];
  banques: Banque[] | null = [];

  // Add helper methods if needed
}
