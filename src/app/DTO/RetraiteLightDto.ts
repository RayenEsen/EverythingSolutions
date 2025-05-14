export class RetraiteLightDto {
  id: number = 0;
  montant: number | null = null;
  numeroCheque: string | null = null;
  dateEcheance: Date | null = null;
  dateCreation: Date = new Date();

  entrepriseNom: string = '';
  entrepriseAdresse: string = '';

  banqueNom: string = '';
  banqueAdresse: string = '';
  banqueRib: string = ''; // Added RIB

  fournisseurNom: string = '';
  fournisseurAdresse: string = '';

  getFormattedEcheance(): string {
    return this.dateEcheance?.toLocaleDateString('fr-TN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) || 'N/A';
  }

  getMontantFormatted(): string {
    return this.montant != null
      ? new Intl.NumberFormat('fr-TN', {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3
        }).format(this.montant) + ' TND'
      : '0.000 TND';
  }

  getFournisseurComplete(): string {
    return `${this.fournisseurNom || 'N/A'}${this.fournisseurAdresse ? ' - ' + this.fournisseurAdresse : ''}`;
  }

  getMontantEnLettres(): string {
    return this.numberToWords(this.montant);
  }

  private numberToWords(num: number | null): string {
    if (num === null) {
      return 'zéro dinar et zéro millime';
    }

    const fixedNum = num.toFixed(3);
    const [integerPart, fractionalPart] = fixedNum.split('.');
    const integerWords = this.convertIntegerPart(parseInt(integerPart, 10));
    const fractionalWords = this.convertIntegerPart(parseInt(fractionalPart, 10));
    return `${integerWords} dinars et ${fractionalWords} millimes`.trim();
  }

  private convertIntegerPart(num: number): string {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    const thousands = ['', 'mille', 'million', 'milliard', 'billion'];

    if (num === 0) return 'zéro';

    let words = '';
    for (let i = 0; num > 0; i++) {
      let chunk = num % 1000;
      num = Math.floor(num / 1000);

      let chunkWords = '';

      if (chunk >= 100) {
        const hundreds = Math.floor(chunk / 100);
        chunkWords += (hundreds > 1 ? units[hundreds] + ' ' : '') + 'cent ';
        chunk %= 100;
      }

      if (chunk >= 20) {
        chunkWords += tens[Math.floor(chunk / 10)];
        if (chunk % 10 !== 0) {
          chunkWords += '-' + units[chunk % 10];
        }
        chunkWords += ' ';
      } else if (chunk >= 10) {
        chunkWords += teens[chunk - 10] + ' ';
      } else if (chunk > 0) {
        chunkWords += units[chunk] + ' ';
      }

      if (chunkWords.trim() !== '') {
        chunkWords += thousands[i] + ' ';
      }

      words = chunkWords + words;
    }

    return words.trim();
  }
}
