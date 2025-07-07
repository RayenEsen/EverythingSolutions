import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../Services/theme.service';
import { DevisService } from '../Services/Devis.service';
import { DevisWithCompanyInfoDto } from '../DTO/DevisResponseDto';
import { ActivatedRoute } from '@angular/router';
import { NumberToWordsFrenchPipe } from '../shared/NumberToWordsFrench.pipe';
import { BanquesService } from '../Services/Banques.service';
import { Banque } from '../shared/Banque';

@Component({
  selector: 'app-ImprimerDevis',
  templateUrl: './ImprimerDevis.component.html',
  styleUrls: ['./ImprimerDevis.component.css'],
  imports: [CommonModule, NumberToWordsFrenchPipe]
})
export class ImprimerDevisComponent implements OnInit {
  devis: DevisWithCompanyInfoDto | null = null;
  isLoading = true;
  error: string | null = null;
  banque: Banque | null = null;

  constructor(
    public themeService: ThemeService,
    private devisService: DevisService,
    private route: ActivatedRoute,
    private banquesService: BanquesService
  ) { }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  printDevis(): void {
    window.print();
  }

  get totalRemise(): number {
    if (!this.devis || !this.devis.articles) return 0;
    return this.devis.articles.reduce((sum, a) => sum + (a.prixUnitaireHT * a.quantite * (a.remise / 100)), 0);
  }

  get tauxTVA(): string | number {
    if (!this.devis || !this.devis.articles || this.devis.articles.length === 0) return '—';
    const uniqueTaux = Array.from(new Set(this.devis.articles.map(a => a.tauxTVA)));
    return uniqueTaux.length === 1 ? uniqueTaux[0] : uniqueTaux.join(', ');
  }

  get totalNet(): number {
    return (this.devis?.totalHT || 0) - this.totalRemise;
  }

  get companyImageUrl(): string {
    const placeholder = 'https://via.placeholder.com/120x60?text=Logo';
    return this.devis?.imageUrl && this.devis.imageUrl.trim() !== '' ? this.devis.imageUrl : placeholder;
  }

  ngOnInit() {
    // Get id from route params (assume 'id' param)
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Aucun identifiant de devis fourni.';
      this.isLoading = false;
      return;
    }
    this.devisService.getWithCompanyInfoById(id).subscribe({
      next: (data) => {
        this.devis = data;
        // Fetch banque after devis loads
        this.banquesService.getFirst().subscribe({
          next: (banque) => { this.banque = banque; this.isLoading = false; },
          error: () => { this.isLoading = false; }
        });
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du devis.';
        this.isLoading = false;
      }
    });
  }
}
