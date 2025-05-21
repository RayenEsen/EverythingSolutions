export class RetenueDto {
  numeroFacture: string = '';
  montantTTC: number = 0;
  type: string = '';
  fournisseurNom: string = '';
  fournisseurAdresse: string = '';

  dateCreation: Date = new Date();
  retenueMontant: number = 0;
  montantNet: number = 0;

  entrepriseNom: string = '';
  entrepriseAdresse: string = '';
}
