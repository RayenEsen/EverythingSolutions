export class RetenueDto {
  id: number = 0;
  numeroFacture: string = '';
  montantTTC: number = 0;
  type: string = '';
  fournisseurNom: string = '';
  fournisseurAdresse: string = '';
  fournisseurMatricule: string = ''; // ✅ Ajout du matricule fiscal

  dateCreation: Date = new Date();
  retenueMontant: number = 0;
  montantNet: number = 0;

  entrepriseNom: string = '';
  entrepriseAdresse: string = '';
}
