export class RetenueDto {
  numeroFacture: string = '';
  montantTTC: number = 0;
  type: string = '';
  fournisseur: string = '';
  dateCreation: Date = new Date();
  retenue: number = 0;
  montantNet: number = 0;
}
