export class AddRetraiteDTO {
  NumCheque: string = '';
  dateEcheance: Date | null = null;
  montant: number = 0;
  fournisseurId: number = 0;
  banqueId: number = 0;
  adresseId: number = 0;
  entrepriseId: number = 0; // ✅ Added this line
  rib: string = '';
}
