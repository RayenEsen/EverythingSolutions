export class Adresse {
  id: number = 0;
  rue: string = '';
  codePostal: string = '';
  ville: string = '';
  pays: string = '';
  estSiegeSocial: boolean = false;
  
  // Add this computed property
  get formattedAddress(): string {
    return `${this.rue}, ${this.codePostal} ${this.ville}, ${this.pays}`;
  }

  constructor(init?: Partial<Adresse>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}