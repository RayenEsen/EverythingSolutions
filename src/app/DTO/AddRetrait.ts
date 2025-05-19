export class AddRetraiteDTO {
  numCheque: string = '';
  dateEcheance: Date | null = null;
  montant: number = 0;
  entrepriseId: number = 0;
  banqueId: number | null = null;  // Nullable banqueId
  fournisseurId: number = 0;
}
