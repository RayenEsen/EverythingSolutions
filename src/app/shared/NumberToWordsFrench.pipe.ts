import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberToWordsFrench',
  standalone: true
})
export class NumberToWordsFrenchPipe implements PipeTransform {
  // Basic French number words for 0-19
  private units: string[] = [
    'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
  ];
  private tens: string[] = [
    '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'
  ];

  transform(value: number): string {
    if (isNaN(value)) return '';
    const dinars = Math.floor(value);
    const millimes = Math.round((value - dinars) * 1000);
    let words = this.convertNumberToWords(dinars) + (dinars > 1 ? ' dinars' : ' dinar');
    if (millimes > 0) {
      words += ', ' + this.convertNumberToWords(millimes) + (millimes > 1 ? ' millimes' : ' millime');
    }
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  private convertNumberToWords(n: number): string {
    if (n < 20) return this.units[n];
    if (n < 100) {
      let ten = Math.floor(n / 10);
      let unit = n % 10;
      let sep = unit === 1 && ten !== 8 ? ' et ' : (unit > 0 ? '-' : '');
      return this.tens[ten] + (unit > 0 ? sep + this.units[unit] : '');
    }
    if (n < 1000) {
      let hundred = Math.floor(n / 100);
      let rest = n % 100;
      let hundredWord = hundred > 1 ? this.units[hundred] + ' cent' : 'cent';
      if (rest === 0) return hundredWord + (hundred > 1 ? 's' : '');
      return hundredWord + ' ' + this.convertNumberToWords(rest);
    }
    if (n < 1000000) {
      let thousand = Math.floor(n / 1000);
      let rest = n % 1000;
      let thousandWord = thousand > 1 ? this.convertNumberToWords(thousand) + ' mille' : 'mille';
      if (rest === 0) return thousandWord;
      return thousandWord + ' ' + this.convertNumberToWords(rest);
    }
    // For simplicity, millions and above
    let million = Math.floor(n / 1000000);
    let rest = n % 1000000;
    let millionWord = million > 1 ? this.convertNumberToWords(million) + ' millions' : 'un million';
    if (rest === 0) return millionWord;
    return millionWord + ' ' + this.convertNumberToWords(rest);
  }
} 