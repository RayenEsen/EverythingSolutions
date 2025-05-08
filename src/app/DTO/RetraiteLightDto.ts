export class RetraiteLightDto {
  id: number = 0;
  montant: number | null = null;
  numeroCheque: string | null = null;
  dateEcheance: Date | null = null;
  
  entrepriseNom: string = '';          // Only company name
  banqueNom: string = '';              // Bank name
  banqueAdresse: string = '';          // Bank address
  fournisseurNom: string = '';         // Supplier name
  fournisseurAdresse: string = '';     // Supplier address
  rib: string = '';     //

  // Helper methods
  getFormattedEcheance(): string {
    return this.dateEcheance?.toLocaleDateString('fr-TN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) || 'N/A';
  }

  getMontantFormatted(): string {
    return this.montant ? 
      new Intl.NumberFormat('fr-TN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      }).format(this.montant) + ' TND' : '0.000 TND';
  }

  getFournisseurComplete(): string {
    return `${this.fournisseurNom || 'N/A'}${this.fournisseurAdresse ? ' - ' + this.fournisseurAdresse : ''}`;
  }
}