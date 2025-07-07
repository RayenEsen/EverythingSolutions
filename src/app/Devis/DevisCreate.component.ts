import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DevisService } from '../Services/Devis.service';
import { ArticleService } from '../Services/Article.service';
import { DevisCreateDto } from '../DTO/DevisCreateDto';
import { Article } from '../shared/Article';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ClientService } from '../Services/Client.service';
import { Client } from '../shared/Client';
import { ThemeService } from '../Services/theme.service';

@Component({
  selector: 'app-devis-create',
  templateUrl: './DevisCreate.component.html',
  styleUrls: ['./Devis.component.css'],
  providers: [MessageService],
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    ToastModule,
    FormsModule,
    InputTextModule,
    TableModule
  ]
})
export class DevisCreateComponent implements OnInit {
  newDevis: DevisCreateDto = { code: '', devisArticles: [], clientId: 0 };
  articles: Article[] = [];
  clients: Client[] = [];
  selectedClient: Client|null = null;
  lines: { article: Article|null, quantite: number, remise: number }[] = [];
  loading = false;
  today: Date = new Date();

  constructor(
    private devisService: DevisService,
    private articleService: ArticleService,
    private clientService: ClientService,
    private messageService: MessageService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadArticles();
    this.loadClients();
    this.generateDevisCode();
    this.lines = [this.createEmptyLine()];
    this.today = new Date();
  }

  loadArticles() {
    this.articleService.getArticles().subscribe({
      next: articles => {
        this.articles = articles;
      },
      error: () => {}
    });
  }

  loadClients() {
    // Get entrepriseId from localStorage or another source
    const stored = JSON.parse(localStorage.getItem('entreprise') || '{}');
    const entrepriseId = stored.id || 0;
    this.clientService.getClientsByEntreprise(entrepriseId).subscribe({
      next: clients => {
        this.clients = clients;
      },
      error: () => {}
    });
  }

  createEmptyLine() {
    return { article: null, quantite: 1, remise: 0 };
  }

  addLine() {
    this.lines.push(this.createEmptyLine());
  }

  removeLine(i: number) {
    this.lines.splice(i, 1);
    if (this.lines.length === 0) this.addLine();
  }

  getAvailableArticles(currentIndex: number): Article[] {
    // Only allow articles not already selected in other lines
    const selectedIds = this.lines
      .map((l, i) => i !== currentIndex && l.article ? l.article.id : null)
      .filter(id => id !== null);
    return this.articles.filter(a => !selectedIds.includes(a.id));
  }

  syncLinesToDevis() {
    this.newDevis.devisArticles = this.lines
      .filter(l => l.article && l.quantite > 0)
      .map(l => ({
        articleId: l.article!.id,
        quantite: l.quantite,
        remise: l.remise
      }));
  }

  generateDevisCode() {
    // Generate a code like DEV123456
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random
    this.newDevis.code = `DEV${randomNum}`;
  }

  saveDevis() {
    this.generateDevisCode();
    this.syncLinesToDevis();
    if (!this.newDevis.devisArticles.length) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Ajoutez au moins un article.' });
      return;
    }
    if (!this.selectedClient) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Sélectionnez un client.' });
      return;
    }
    this.newDevis.clientId = this.selectedClient.id;
    this.devisService.create(this.newDevis).subscribe({
      next: devis => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Devis ajouté avec succès.' });
        setTimeout(() => this.router.navigate(['/Devis']), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'ajout du devis.' });
      }
    });
  }

  cancel() {
    this.router.navigate(['/Devis']);
  }

  getLineTotal(article: Article|null, quantite: number, remise: number): number {
    if (!article) return 0;
    return (article.prixVenteTTC || 0) * quantite * (1 - remise / 100);
  }

  getTotalQuantity(): number {
    return this.lines.reduce((sum, l) => sum + (l.article ? l.quantite : 0), 0);
  }

  getEstimatedTotal(): number {
    return this.lines.reduce((sum, l) => sum + this.getLineTotal(l.article, l.quantite, l.remise), 0);
  }

  get linesWithArticleCount(): number {
    return this.lines.filter(l => l.article).length;
  }

  get isDarkMode(): boolean {
    return this.themeService?.isDarkMode && this.themeService.isDarkMode();
  }
} 