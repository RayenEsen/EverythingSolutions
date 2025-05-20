export class AddRetenueDTO {
  numeroFacture: string = '';
  montantTTC: number = 0;
  type: string = '';
  fournisseurId: number = 0;
  dateCreation: Date = new Date();  // Defaults to current date
  retenue: number = 0;
  montantNet: number = 0;
}
