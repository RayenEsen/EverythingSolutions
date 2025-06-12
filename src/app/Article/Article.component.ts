import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../Services/theme.service';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DrawerModule } from 'primeng/drawer';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Article } from '../shared/Article';
import { TVA } from '../shared/TVA';
import { Stock } from '../shared/Stock';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { ChartModule } from 'primeng/chart';
import { ArticleService } from '../Services/Article.service';
import { TVAService } from '../Services/TVA.service';
import { StockService } from '../Services/Stock.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { AddStock } from '../DTO/AddStock';
import { AddArticle } from '../DTO/AddArticle';

@Component({
  selector: 'app-Article',
  templateUrl: './Article.component.html',
  styleUrls: ['./Article.component.css'],
  standalone: true,
  imports: [
    ConfirmDialogModule,
    MenubarModule,
    ToastModule,
    CommonModule,
    Menubar,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    ContextMenuModule,
    DrawerModule,
    FormsModule,
    InputNumberModule,
    DialogModule,
    DropdownModule,
    AutoCompleteModule,
    ChartModule,
    HttpClientModule
  ],
  providers: [ConfirmationService, MessageService, ArticleService, TVAService, StockService],
})
export class ArticleComponent implements OnInit {
  stock: Stock = { id: 1, name: '', code: '', articles: [] };
  searchText: string = '';
  loading: boolean = false;

  totalArticles: number = 0;
  totalValueHT: number = 0;
  averagePriceHT: number = 0;

  selectedArticle: Article | null = null;
  SelectedArticles: Article[] = [];

  AddArticleInfo: boolean = false;
  currentArticle: Article = {
    id: 0,
    code: '',
    designation: '',
    prixAchatHT: 0,
    tva: { id: 0, code: '', taux: 0 },
    prixVenteHT: 0,
    gouvernerat: '',
  };

  tvaOptions: TVA[] = [];

  selectedTVA: TVA | null = null;

  showCodeError: boolean = false;
  showDesignationError: boolean = false;
  showPrixAchatHTError: boolean = false;
  showPrixVenteHTError: boolean = false;
  showTVAError: boolean = false;
  showGouverneratError: boolean = false;

  // New properties for TVA management
  AddTVAInfo: boolean = false;
  newTVA: TVA = { id: 0, code: '', taux: 0 };
  showNewTVACodeError: boolean = false;
  showNewTVATauxError: boolean = false;
  clonedTVA: { [s: string]: TVA } = {};

  // New property for TVA list dialog
  dialogVisibleTVA: boolean = false;

  // New properties for Stock management
  stockOptions: Stock[] = [];
  selectedStock: Stock | null = null;
  AddStockInfo: boolean = false;
  newStock: Stock = { id: 0, name: '', code: '', articles: [] };
  showNewStockIdError: boolean = false;
  showNewStockNameError: boolean = false;
  showNewStockCodeError: boolean = false;
  dialogVisibleStock: boolean = false;
  clonedStock: { [s: string]: Stock } = {};

  // Chart data and options
  salesByDesignationChartData: any;
  salesByDesignationChartOptions: any;
  articlesByTVAChartData: any;
  articlesByTVAChartOptions: any;

  tunisDesignations: string[] = [
    'Ariana',
    'Béja',
    'Ben Arous',
    'Bizerte',
    'Gabès',
    'Gafsa',
    'Jendouba',
    'Kairouan',
    'Kasserine',
    'Kébili',
    'Le Kef',
    'Mahdia',
    'Manouba',
    'Médenine',
    'Monastir',
    'Nabeul',
    'Sfax',
    'Sidi Bouzid',
    'Siliana',
    'Sousse',
    'Tataouine',
    'Tozeur',
    'Tunis',
    'Zaghouan'
  ];
  
  gouverneratSuggestions: string[] = this.tunisDesignations;
  
  filteredDesignations: string[] = [];
  filteredStocks: Stock[] = [];

  items: MenuItem[] = [
    {
      label: 'Ajouter Article',
      icon: 'pi pi-plus',
      command: () => this.openModal('create'),
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash',
      command: () => this.deleteSelectedArticles(),
    },
  ];

  items2: MenuItem[] = [
    {
      label: 'Modifier Article',
      icon: 'pi pi-pencil',
      command: () => this.openModal('edit', this.selectedArticle || undefined),
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash',
      command: () => this.deleteArticle(this.selectedArticle!),
    },
  ];

  constructor(
    public themeService: ThemeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private articleService: ArticleService,
    private tvaService: TVAService,
    private stockService: StockService
  ) {
    // Subscribe to theme changes to update chart colors
    this.themeService.darkMode$.subscribe(() => {
      this.initCharts();
      // Force chart re-render by creating new object references
      this.salesByDesignationChartData = { ...this.salesByDesignationChartData };
      this.articlesByTVAChartData = { ...this.articlesByTVAChartData };
    });
  }

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.loading = true;
    forkJoin({
      articles: this.articleService.getArticles(),
      tvas: this.tvaService.getTVAs(),
      stocks: this.stockService.getStocks()
    }).subscribe({
      next: (data: { articles: Article[], tvas: TVA[], stocks: Stock[] }) => {
        this.stock.articles = data.articles;
        this.tvaOptions = data.tvas;
        this.stockOptions = data.stocks; // Populate stockOptions
        if (this.tvaOptions.length > 0) {
          this.selectedTVA = this.tvaOptions[0];
        }
        // Set initial selectedStock if any exists
        if (this.stockOptions.length > 0) {
          this.selectedStock = this.stockOptions[0];
        }
        this.calculateStats();
        this.initCharts();
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading initial data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec du chargement des données initiales (articles, TVA ou stocks).',
        });
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.totalArticles = this.stock.articles.length;
    this.totalValueHT = this.stock.articles.reduce((sum, article) => sum + article.prixVenteHT, 0);
    this.averagePriceHT = this.totalArticles > 0 ? this.totalValueHT / this.totalArticles : 0;
  }

  filterArticles() {
    const text = this.searchText?.toLowerCase() || '';
    this.stock.articles = this.stock.articles.filter((article) =>
      Object.values(article).some((value) =>
        String(value).toLowerCase().includes(text)
      ) ||
      article.tva.code.toLowerCase().includes(text)
      || article.gouvernerat?.toLowerCase().includes(text)
    );
  }

  openModal(mode: 'create' | 'edit', article?: Article) {
    this.showCodeError = false;
    this.showDesignationError = false;
    this.showPrixAchatHTError = false;
    this.showPrixVenteHTError = false;
    this.showTVAError = false;
    this.showGouverneratError = false;
    this.showNewStockIdError = false;

    if (mode === 'edit' && article) {
      this.currentArticle = { ...article };
      this.selectedTVA = this.tvaOptions.find(t => t.id === article.tva.id) || null;
      this.selectedStock = this.stockOptions.find(s => s.id === article.stockId) || null;
    } else {
      this.currentArticle = {
        id: 0,
        code: '',
        designation: '',
        prixAchatHT: 0,
        tva: this.tvaOptions.length > 0 ? this.tvaOptions[0] : { id: 0, code: '', taux: 0 },
        prixVenteHT: 0,
        gouvernerat: '',
        stockId: undefined,
      };
      this.selectedTVA = this.tvaOptions.length > 0 ? this.tvaOptions[0] : null;
      this.selectedStock = this.stockOptions.length > 0 ? this.stockOptions[0] : null;
    }
    this.AddArticleInfo = true;
  }

  filterGouvernerats(event: any) {
    const query = event.query.toLowerCase();
    this.gouverneratSuggestions = this.tunisDesignations.filter(gouvernerat =>
      gouvernerat.toLowerCase().includes(query)
    );
  }

  filterStocks(event: any) {
    let filtered: Stock[] = [];
    let query = event.query;

    for (let i = 0; i < this.stockOptions.length; i++) {
        let stock = this.stockOptions[i];
        // Filter by stock ID, name or code
        if (String(stock.id).toLowerCase().includes(query.toLowerCase()) ||
            stock.name.toLowerCase().includes(query.toLowerCase()) ||
            stock.code.toLowerCase().includes(query.toLowerCase())) {
            filtered.push(stock);
        }
    }
    this.filteredStocks = filtered;
  }

  saveArticle() {
    this.showCodeError = !this.currentArticle.code.trim();
    this.showDesignationError = !this.currentArticle.designation;
    this.showPrixAchatHTError = this.currentArticle.prixAchatHT === 0 || this.currentArticle.prixAchatHT === null || this.currentArticle.prixAchatHT === undefined;
    this.showPrixVenteHTError = this.currentArticle.prixVenteHT === 0 || this.currentArticle.prixVenteHT === null || this.currentArticle.prixVenteHT === undefined;
    this.showTVAError = !this.selectedTVA;
    this.showGouverneratError = !this.currentArticle.gouvernerat || !this.gouverneratSuggestions.includes(this.currentArticle.gouvernerat);
    this.showNewStockIdError = !this.selectedStock;

    if (
      this.showCodeError ||
      this.showDesignationError ||
      this.showPrixAchatHTError ||
      this.showPrixVenteHTError ||
      this.showTVAError ||
      this.showGouverneratError ||
      this.showNewStockIdError
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de validation',
        detail: 'Veuillez remplir tous les champs requis.',
      });
      return;
    }

    const addArticle: AddArticle = {
      code: this.currentArticle.code,
      designation: this.currentArticle.designation,
      prixAchatHT: this.currentArticle.prixAchatHT,
      tvaId: this.selectedTVA ? this.selectedTVA.id : null,
      prixVenteHT: this.currentArticle.prixVenteHT,
      gouvernerat: this.currentArticle.gouvernerat,
      stockId: this.selectedStock ? this.selectedStock.id : undefined,
    };

    if (this.currentArticle.id) {
      // Edit existing article
      this.articleService.updateArticle(this.currentArticle.id, addArticle).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Article mis à jour avec succès',
          });
          this.loadInitialData();
          this.AddArticleInfo = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating article:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Échec de la mise à jour de l'article: ${error.message || error.error.message}`,
          });
        },
      });
    } else {
      // Add new article
      this.articleService.addArticle(addArticle).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Article ajouté avec succès',
          });
          this.loadInitialData();
          this.AddArticleInfo = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error adding article:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Échec de l'ajout de l'article: ${error.message || error.error.message}`,
          });
        },
      });
    }
  }

  deleteArticle(article: Article) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer l'article "${article.designation}"?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.articleService.deleteArticle(article.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Article supprimé avec succès!',
            });
            this.loadInitialData(); // Reload articles after deletion
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error deleting article:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec de la suppression de l"article.',
            });
          },
        });
      },
    });
  }

  deleteSelectedArticles() {
    if (this.SelectedArticles.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucune sélection',
        detail: 'Veuillez sélectionner au moins un article à supprimer.',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${this.SelectedArticles.length} article(s)?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi ',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        // Create an array of Observables for each delete operation
        const deleteObservables = this.SelectedArticles.map(article =>
          this.articleService.deleteArticle(article.id)
        );

        // Use forkJoin to wait for all delete operations to complete
        forkJoin(deleteObservables).subscribe({
          next: () => {
            this.SelectedArticles = []; // Clear selection after successful deletion
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Articles sélectionnés supprimés avec succès!',
            });
            this.loadInitialData(); // Reload articles after all deletions
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error deleting selected articles:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec de la suppression des articles sélectionnés.',
            });
          },
        });
      },
    });
  }

  toggleAddTVAInfo() {
    this.AddTVAInfo = !this.AddTVAInfo;
    this.newTVA = { id: 0, code: '', taux: 0 }; // Reset new TVA form
    this.showNewTVACodeError = false;
    this.showNewTVATauxError = false;
  }

  toggleDialogTVA() {
    this.dialogVisibleTVA = !this.dialogVisibleTVA;
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    
    // Dynamically determine colors based on theme
    const textColor = this.themeService.isDarkMode() ? '#e2e8f0' : documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = this.themeService.isDarkMode() ? '#b0b0b0' : documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = this.themeService.isDarkMode() ? '#4a5568' : documentStyle.getPropertyValue('--surface-border');

    // Data for Sales by Designation (Bar Chart)
    const salesByDesignationMap = new Map<string, number>();
    this.stock.articles.forEach(article => {
      salesByDesignationMap.set(article.designation, (salesByDesignationMap.get(article.designation) || 0) + article.prixVenteHT);
    });
    const salesByDesignationLabels = Array.from(salesByDesignationMap.keys());
    const salesByDesignationValues = Array.from(salesByDesignationMap.values());

    const salesChartBackgroundColor = this.themeService.isDarkMode() ? '#60a5fa' : '#7b92e1'; // Dynamic color based on theme
    const salesChartBorderColor = this.themeService.isDarkMode() ? '#60a5fa' : '#7b92e1'; // Dynamic color based on theme

    this.salesByDesignationChartData = {
      labels: salesByDesignationLabels,
      datasets: [
        {
          label: 'Valeur des Ventes',
          data: salesByDesignationValues,
          backgroundColor: salesChartBackgroundColor,
          borderColor: salesChartBorderColor,
          borderWidth: 1
        }
      ]
    };

    this.salesByDesignationChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.5,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };

    // Data for Articles by TVA (Bar Chart)
    const articlesByTVAMap = new Map<string, number>();
    this.stock.articles.forEach(article => {
      articlesByTVAMap.set(article.tva.code, (articlesByTVAMap.get(article.tva.code) || 0) + 1);
    });
    const articlesByTVALabels = Array.from(articlesByTVAMap.keys());
    const articlesByTVAValues = Array.from(articlesByTVAMap.values());

    // Define distinct palettes of colors for the Pie chart for both themes
    const lightModeColors = [
      '#7b92e1', // Muted Blue (similar to image)
      '#3cbfae', // Teal/Green (similar to image)
      '#ffc00a', // Golden Yellow (similar to image)
      '#7a9e6d', // A new shade of green (replacing brown)
      '#EC407A', // Pink (additional)
      '#78909C'  // Blue Grey (additional)
    ];

    const darkModeColors = [
      '#7b92e1', // Muted Blue (similar to image)
      '#3cbfae', // Teal/Green (similar to image)
      '#ffc00a', // Golden Yellow (similar to image)
      '#8ec07f', // Lighter shade of green for Dark Mode (replacing light brown)
      '#F06292', // Light Pink (additional)
      '#90A4AE'  // Light Blue Grey (additional)
    ];

    const currentColors = this.themeService.isDarkMode() ? darkModeColors : lightModeColors;
    const backgroundColors = articlesByTVALabels.map((_, i) => currentColors[i % currentColors.length]);

    this.articlesByTVAChartData = {
      labels: articlesByTVALabels,
      datasets: [
        {
          data: articlesByTVAValues,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: backgroundColors
        }
      ]
    };

    this.articlesByTVAChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      cutout: '65%',
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    };
  }

  adjustColorBrightness(hex: string, factor: number) {
    let c = hex.substring(1);
    let rgb = parseInt(c, 16);
    let r = (rgb >> 16) & 0xff;
    let g = (rgb >> 8) & 0xff;
    let b = (rgb >> 0) & 0xff;

    r = Math.min(255, Math.floor(r * factor));
    g = Math.min(255, Math.floor(g * factor));
    b = Math.min(255, Math.floor(b * factor));

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  onSaveNewTVA() {
    this.showNewTVACodeError = !this.newTVA.code.trim();
    this.showNewTVATauxError = this.newTVA.taux === 0 || this.newTVA.taux === null || this.newTVA.taux === undefined || this.newTVA.taux < 0 || this.newTVA.taux > 100;

    if (this.showNewTVACodeError || this.showNewTVATauxError) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs requis pour la TVA et s\'assurer que le taux est entre 0 et 100.',
      });
      return;
    }

    this.tvaService.postTVA(this.newTVA).subscribe({
      next: (tva: TVA) => {
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'TVA ajoutée avec succès!',
    });
        this.AddTVAInfo = false;
        this.loadInitialData(); // Reload TVAs after adding
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error adding TVA:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de l\'ajout de la TVA.',
        });
      },
    });
  }

  onRowEditInitTVA(tva: TVA) {
    this.clonedTVA[tva.id as unknown as string] = { ...tva };
  }

  onRowEditSaveTVA(tva: TVA) {
    if (tva.code.trim() && tva.taux >= 0 && tva.taux <= 100) {
      this.tvaService.putTVA(tva.id, tva).subscribe({
        next: () => {
          delete this.clonedTVA[tva.id as unknown as string];
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'TVA mise à jour avec succès.'
          });
          this.loadInitialData(); // Reload TVAs after updating
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating TVA:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
            detail: 'Échec de la mise à jour de la TVA.'
          });
          this.onRowEditCancelTVA(tva, (this.tvaOptions.findIndex((item) => item.id === tva.id)));
        }
      });
    } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
        detail: 'Le code et le taux de TVA sont requis, et le taux doit être entre 0 et 100.'
      });
    }
  }

  onRowEditCancelTVA(tva: TVA, index: number) {
    this.tvaOptions[index] = this.clonedTVA[tva.id as unknown as string];
    delete this.clonedTVA[tva.id as unknown as string];
  }

  confirmDeleteTVA(tva: TVA) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer la TVA avec le code "${tva.code}"?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.tvaService.deleteTVA(tva.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'TVA supprimée avec succès!',
            });
            this.loadInitialData(); // Reload TVAs after deletion
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error deleting TVA:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec de la suppression de la TVA.',
            });
          },
        });
      },
    });
  }

  toggleAddStockInfo() {
    this.AddStockInfo = !this.AddStockInfo;
    this.newStock = { id: 0, name: '', code: '', articles: [] }; // Reset new stock form
    this.showNewStockIdError = false;
    this.showNewStockNameError = false;
    this.showNewStockCodeError = false;
  }

  onSaveNewStock() {
    this.showNewStockNameError = !this.newStock.name.trim();
    this.showNewStockCodeError = !this.newStock.code.trim();

    if (this.showNewStockNameError || this.showNewStockCodeError) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez entrer un nom et un code pour le stock.',
      });
      return;
    }

    this.stockService.postStock({ name: this.newStock.name, code: this.newStock.code }).subscribe({
      next: (stock: Stock) => {
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Stock ajouté avec succès!',
    });
    this.AddStockInfo = false; // Close drawer
        this.loadInitialData(); // Reload stocks after adding
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error adding stock:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de l\'ajout du stock.',
        });
      },
    });
  }

  toggleDialogStock() {
    this.dialogVisibleStock = !this.dialogVisibleStock;
  }

  onRowEditInitStock(stock: Stock) {
    this.clonedStock[stock.id as unknown as string] = { ...stock };
  }

  onRowEditSaveStock(stock: Stock) {
    if (stock.id === null || stock.id <= 0 || !stock.name.trim() || !stock.code.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'L\'ID, le nom et le code du stock sont requis, et l\'ID doit être un nombre positif.',
      });
      this.onRowEditCancelStock(stock, this.stockOptions.findIndex(item => item.id === stock.id));
    } else {
      this.stockService.putStock(stock.id, stock).subscribe({
        next: () => {
          delete this.clonedStock[stock.id as unknown as string];
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Stock mis à jour avec succès!'
          });
          this.loadInitialData(); // Reload stocks after updating
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating stock:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
            detail: 'Échec de la mise à jour du stock.'
        });
          this.onRowEditCancelStock(stock, (this.stockOptions.findIndex((item) => item.id === stock.id)));
      }
      });
    }
  }

  onRowEditCancelStock(stock: Stock, index: number) {
    this.stockOptions[index] = this.clonedStock[stock.id as unknown as string];
    delete this.clonedStock[stock.id as unknown as string];
    this.messageService.add({ severity: 'info', summary: 'Annulation', detail: 'La modification du stock a été annulée.' });
  }

  confirmDeleteStock(stock: Stock) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le stock ID: ${stock.id}? Tous les articles associés à ce stock seront orphelins.`, // Warn about orphaned articles
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.stockService.deleteStock(stock.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Stock supprimé avec succès!',
            });
            this.loadInitialData(); // Reload stocks after deletion
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error deleting stock:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec de la suppression du stock.',
            });
          },
        });
      },
    });
  }

  loadTVAs() {
    this.tvaService.getTVAs().subscribe({
      next: (data) => {
        this.tvaOptions = data;
        if (this.tvaOptions.length > 0) {
          this.selectedTVA = this.tvaOptions[0];
        }
      },
      error: (error) => {
        console.error('Error loading TVAs:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec du chargement des TVAs.',
        });
      },
    });
  }
}
