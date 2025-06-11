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
  ],
  providers: [ConfirmationService, MessageService],
})
export class ArticleComponent implements OnInit {
  stock: Stock = { id: 1, articles: [] };
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
    tva: { id: 1, code: 'TVA_20', taux: 20 },
    prixVenteHT: 0,
  };

  tvaOptions: TVA[] = [
    { id: 1, code: 'TVA_20', taux: 20 },
    { id: 2, code: 'TVA_10', taux: 10 },
    { id: 3, code: 'TVA_7', taux: 7 },
    { id: 4, code: 'TVA_0', taux: 0 },
  ];

  selectedTVA: TVA = this.tvaOptions[0];

  showCodeError: boolean = false;
  showDesignationError: boolean = false;
  showPrixAchatHTError: boolean = false;
  showPrixVenteHTError: boolean = false;
  showTVAError: boolean = false;

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
  newStock: Stock = { id: 0, articles: [] };
  showNewStockIdError: boolean = false;
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
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadArticles();
    this.initCharts();
  }

  loadArticles() {
    // Initialize some dummy stocks
    this.stockOptions = [
      { id: 101, articles: [] },
      { id: 102, articles: [] },
      { id: 103, articles: [] }
    ];

    this.stock.articles = [
      { id: 1, code: 'ART-001-A', designation: 'Ariana', prixAchatHT: 800, tva: this.tvaOptions[0], prixVenteHT: 1200, prixVenteTTC: 1440, marge: 0.5, stockId: 101 },
      { id: 2, code: 'ART-002-B', designation: 'Sfax', prixAchatHT: 10, tva: this.tvaOptions[1], prixVenteHT: 20, prixVenteTTC: 22, marge: 1, stockId: 101 },
      { id: 3, code: 'ART-003-C', designation: 'Monastir', prixAchatHT: 50, tva: this.tvaOptions[0], prixVenteHT: 80, prixVenteTTC: 96, marge: 0.6, stockId: 102 },
      { id: 4, code: 'ART-004-D', designation: 'Sousse', prixAchatHT: 300, tva: this.tvaOptions[0], prixVenteHT: 500, prixVenteTTC: 600, marge: 0.666, stockId: 103 },
      { id: 5, code: 'ART-005-E', designation: 'Tunis', prixAchatHT: 150, tva: this.tvaOptions[1], prixVenteHT: 250, prixVenteTTC: 275, marge: 0.666, stockId: 101 },
      { id: 6, code: 'ART-006-F', designation: 'Gabès', prixAchatHT: 200, tva: this.tvaOptions[2], prixVenteHT: 300, prixVenteTTC: 321, marge: 0.5, stockId: 102 },
      { id: 7, code: 'ART-007-G', designation: 'Nabeul', prixAchatHT: 75, tva: this.tvaOptions[0], prixVenteHT: 120, prixVenteTTC: 144, marge: 0.6, stockId: 103 },
      { id: 8, code: 'ART-008-H', designation: 'Jendouba', prixAchatHT: 400, tva: this.tvaOptions[1], prixVenteHT: 600, prixVenteTTC: 660, marge: 0.5, stockId: 101 },
      { id: 9, code: 'ART-009-I', designation: 'Kairouan', prixAchatHT: 60, tva: this.tvaOptions[2], prixVenteHT: 90, prixVenteTTC: 96.3, marge: 0.5, stockId: 102 },
      { id: 10, code: 'ART-010-J', designation: 'Bizerte', prixAchatHT: 120, tva: this.tvaOptions[0], prixVenteHT: 180, prixVenteTTC: 216, marge: 0.5, stockId: 103 },
    ];

    // Distribute articles to stocks based on stockId
    this.stock.articles.forEach(article => {
      const targetStock = this.stockOptions.find(s => s.id === article.stockId);
      if (targetStock) {
        targetStock.articles.push(article);
      }
    });

    this.calculateStats();
  }

  calculateStats() {
    this.totalArticles = this.stock.articles.length;
    this.totalValueHT = this.stock.articles.reduce((sum, article) => sum + article.prixVenteHT, 0);
    this.averagePriceHT = this.totalArticles > 0 ? this.totalValueHT / this.totalArticles : 0;
    this.initCharts();
  }

  filterArticles() {
    const text = this.searchText?.toLowerCase() || '';
    this.stock.articles = this.stock.articles.filter((article) =>
      Object.values(article).some((value) =>
        String(value).toLowerCase().includes(text)
      ) ||
      article.tva.code.toLowerCase().includes(text)
    );
  }

  openModal(mode: 'create' | 'edit', article?: Article) {
    this.showCodeError = false;
    this.showDesignationError = false;
    this.showPrixAchatHTError = false;
    this.showPrixVenteHTError = false;
    this.showTVAError = false;
    this.showNewStockIdError = false; // Reset stock error

    if (mode === 'create') {
      this.currentArticle = {
        id: 0,
        code: '',
        designation: '',
        prixAchatHT: 0,
        tva: this.tvaOptions[0],
        prixVenteHT: 0,
        stockId: undefined, // Clear stockId for new articles
      };
      this.selectedTVA = this.tvaOptions[0];
      this.selectedStock = null; // Clear selected stock for new articles
    } else if (mode === 'edit' && article) {
      this.currentArticle = { ...article };
      this.selectedTVA = article.tva;
      // Set selectedStock if stockId exists
      this.selectedStock = this.stockOptions.find(s => s.id === article.stockId) || null;
    }
    this.AddArticleInfo = true;
  }

  filterDesignations(event: any) {
    let filtered: string[] = [];
    let query = event.query;

    for (let i = 0; i < this.tunisDesignations.length; i++) {
      let designation = this.tunisDesignations[i];
      if (designation.toLowerCase().startsWith(query.toLowerCase())) {
        filtered.push(designation);
      }
    }
    this.filteredDesignations = filtered;
  }

  filterStocks(event: any) {
    let filtered: Stock[] = [];
    let query = event.query;

    for (let i = 0; i < this.stockOptions.length; i++) {
        let stock = this.stockOptions[i];
        // Filter by stock ID (can adjust to other properties if Stock had them)
        if (String(stock.id).toLowerCase().includes(query.toLowerCase())) {
            filtered.push(stock);
        }
    }
    this.filteredStocks = filtered;
  }

  saveArticle() {
    this.showCodeError = !this.currentArticle.code.trim();
    this.showDesignationError = !this.currentArticle.designation || !this.tunisDesignations.includes(this.currentArticle.designation);
    this.showPrixAchatHTError = this.currentArticle.prixAchatHT === 0 || this.currentArticle.prixAchatHT === null || this.currentArticle.prixAchatHT === undefined;
    this.showPrixVenteHTError = this.currentArticle.prixVenteHT === 0 || this.currentArticle.prixVenteHT === null || this.currentArticle.prixVenteHT === undefined;
    this.showTVAError = !this.selectedTVA;
    this.showNewStockIdError = !this.selectedStock; // Validate stock selection

    if (
      this.showCodeError ||
      this.showDesignationError ||
      this.showPrixAchatHTError ||
      this.showPrixVenteHTError ||
      this.showTVAError ||
      this.showNewStockIdError // Include stock error in overall validation
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs requis et sélectionner une désignation/TVA/Stock valide.',
      });
      return;
    }

    this.currentArticle.tva = this.selectedTVA;
    this.currentArticle.stockId = this.selectedStock?.id; // Assign selected stock ID

    this.currentArticle.prixVenteTTC = this.currentArticle.prixVenteHT * (1 + (this.currentArticle.tva.taux / 100));

    if (this.currentArticle.prixAchatHT !== 0) {
      this.currentArticle.marge = (this.currentArticle.prixVenteHT - this.currentArticle.prixAchatHT) / this.currentArticle.prixAchatHT;
    } else {
      this.currentArticle.marge = 0;
    }

    if (this.currentArticle.id === 0) {
      // Add to main article list
      const newId = Math.max(...this.stock.articles.map((a) => a.id)) + 1;
      const newArticle: Article = { ...this.currentArticle, id: newId };
      this.stock.articles.push(newArticle);

      // Add to selected stock's articles list
      const targetStock = this.stockOptions.find(s => s.id === newArticle.stockId);
      if (targetStock) {
        targetStock.articles.push(newArticle);
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Article ajouté avec succès!',
      });
    } else {
      // Update in main article list
      const index = this.stock.articles.findIndex(
        (a) => a.id === this.currentArticle.id
      );
      if (index !== -1) {
        // Remove from old stock's articles list if stockId changed
        const oldArticle = this.stock.articles[index];
        if (oldArticle.stockId !== this.currentArticle.stockId) {
          const oldStock = this.stockOptions.find(s => s.id === oldArticle.stockId);
          if (oldStock) {
            oldStock.articles = oldStock.articles.filter(a => a.id !== oldArticle.id);
          }
        }

        this.stock.articles[index] = { ...this.currentArticle };

        // Add to new stock's articles list
        const newStock = this.stockOptions.find(s => s.id === this.currentArticle.stockId);
        if (newStock && !newStock.articles.some(a => a.id === this.currentArticle.id)) {
          newStock.articles.push(this.currentArticle);
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Article modifié avec succès!',
        });
      }
    }
    this.calculateStats();
    this.AddArticleInfo = false;
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
        this.stock.articles = this.stock.articles.filter(
          (a) => a.id !== article.id
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Article supprimé avec succès!',
        });
        this.calculateStats();
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
        const idsToDelete = new Set(this.SelectedArticles.map((a) => a.id));
        this.stock.articles = this.stock.articles.filter(
          (a) => !idsToDelete.has(a.id)
        );
        this.SelectedArticles = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Articles sélectionnés supprimés avec succès!',
        });
        this.calculateStats();
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

    const salesChartBackgroundColor = this.themeService.isDarkMode() ? '#6366f1' : documentStyle.getPropertyValue('--primary-color');
    const salesChartBorderColor = this.themeService.isDarkMode() ? '#6366f1' : documentStyle.getPropertyValue('--primary-color');

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

    // Define a palette of colors for the Doughnut chart
    const defaultColors = [
        documentStyle.getPropertyValue('--primary-color'),
        documentStyle.getPropertyValue('--secondary-color'),
        '#ffc107', // Amber
        '#17a2b8', // Cyan
        '#dc3545', // Red
        '#28a745', // Green
        '#6f42c1', // Purple
        '#fd7e14'  // Orange
    ];

    const darkColors = [
        '#6366f1', // Indigo
        '#3cbfae', // Teal
        '#fbbf24', // Amber
        '#22d3ee', // Cyan
        '#ef4444', // Red
        '#10b981', // Green
        '#8b5cf6', // Violet
        '#f97316'  // Orange
    ];

    const backgroundColors = this.themeService.isDarkMode() ? darkColors : defaultColors;

    this.articlesByTVAChartData = {
      labels: articlesByTVALabels,
      datasets: [
        {
          label: 'Nombre dArticles',
          data: articlesByTVAValues,
          backgroundColor: backgroundColors.slice(0, articlesByTVALabels.length),
          hoverBackgroundColor: backgroundColors.slice(0, articlesByTVALabels.length).map(color => this.adjustColorBrightness(color, 1.2)), // Lighten on hover
        }
      ]
    };

    this.articlesByTVAChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.5,
      plugins: {
        legend: {
          labels: {
            color: textColor
          },
          position: 'right'
        }
      },
      cutout: '70%'
    };
  }

  // Helper function to adjust color brightness (e.g., for hover effect)
  adjustColorBrightness(hex: string, factor: number) {
    let c = parseInt(hex.slice(1), 16);
    let r = (c >> 16) * factor;
    let g = ((c >> 8) & 0x00FF) * factor;
    let b = (c & 0x0000FF) * factor;

    r = Math.round(Math.min(Math.max(0, r), 255));
    g = Math.round(Math.min(Math.max(0, g), 255));
    b = Math.round(Math.min(Math.max(0, b), 255));

    return "#" + ("00" + r.toString(16)).slice(-2) + ("00" + g.toString(16)).slice(-2) + ("00" + b.toString(16)).slice(-2);
  }

  onSaveNewTVA() {
    this.showNewTVACodeError = !this.newTVA.code.trim();
    this.showNewTVATauxError = this.newTVA.taux === null || this.newTVA.taux < 0 || this.newTVA.taux > 100;

    if (this.showNewTVACodeError || this.showNewTVATauxError) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir correctement tous les champs de la TVA.',
      });
      return;
    }

    // Check for duplicate TVA code
    if (this.tvaOptions.some(t => t.code.toLowerCase() === this.newTVA.code.toLowerCase())) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Ce code TVA existe déjà.',
      });
      return;
    }

    const newId = Math.max(...this.tvaOptions.map(t => t.id), 0) + 1;
    this.tvaOptions.push({ ...this.newTVA, id: newId });
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'TVA ajoutée avec succès!',
    });
    this.newTVA = { id: 0, code: '', taux: 0 }; // Reset form
    this.AddTVAInfo = false; // Close drawer
  }

  onRowEditInitTVA(tva: TVA) {
    this.clonedTVA[tva.id as unknown as string] = { ...tva };
  }

  onRowEditSaveTVA(tva: TVA) {
    if (tva.code.trim() === '' || tva.taux === null || tva.taux < 0 || tva.taux > 100) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Le code et le taux de la TVA sont requis et le taux doit être entre 0 et 100.',
      });
      this.onRowEditCancelTVA(tva, this.tvaOptions.findIndex(item => item.id === tva.id));
    } else {
      // Check for duplicate code (excluding current editing item)
      if (this.tvaOptions.some(item => item.code.toLowerCase() === tva.code.toLowerCase() && item.id !== tva.id)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Ce code TVA existe déjà.',
        });
        this.onRowEditCancelTVA(tva, this.tvaOptions.findIndex(item => item.id === tva.id));
        return;
      }

      delete this.clonedTVA[tva.id as unknown as string];
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'TVA mise à jour avec succès!' });
    }
  }

  onRowEditCancelTVA(tva: TVA, index: number) {
    this.tvaOptions[index] = this.clonedTVA[tva.id as unknown as string];
    delete this.clonedTVA[tva.id as unknown as string];
    this.messageService.add({ severity: 'info', summary: 'Annulation', detail: 'La modification de la TVA a été annulée.' });
  }

  confirmDeleteTVA(tva: TVA) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer la TVA "${tva.code}"?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.tvaOptions = this.tvaOptions.filter(t => t.id !== tva.id);
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'TVA supprimée avec succès!' });
      },
    });
  }

  toggleAddStockInfo() {
    this.AddStockInfo = !this.AddStockInfo;
    this.newStock = { id: 0, articles: [] }; // Reset new stock form
    this.showNewStockIdError = false;
  }

  onSaveNewStock() {
    this.showNewStockIdError = this.newStock.id === null || this.newStock.id <= 0;

    if (this.showNewStockIdError) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez entrer un ID de stock valide (nombre positif).',
      });
      return;
    }

    // Check for duplicate Stock ID
    if (this.stockOptions.some(s => s.id === this.newStock.id)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Cet ID de stock existe déjà.',
      });
      return;
    }

    this.stockOptions.push({ ...this.newStock, articles: [] }); // Add new stock with empty articles array
    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Stock ajouté avec succès!',
    });
    this.newStock = { id: 0, articles: [] }; // Reset form
    this.AddStockInfo = false; // Close drawer
  }

  toggleDialogStock() {
    this.dialogVisibleStock = !this.dialogVisibleStock;
  }

  onRowEditInitStock(stock: Stock) {
    this.clonedStock[stock.id as unknown as string] = { ...stock };
  }

  onRowEditSaveStock(stock: Stock) {
    if (stock.id === null || stock.id <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'LID du stock est requis et doit être un nombre positif.',
      });
      this.onRowEditCancelStock(stock, this.stockOptions.findIndex(item => item.id === stock.id));
    } else {
      // Check for duplicate ID (excluding current editing item)
      if (this.stockOptions.some(item => item.id === stock.id && item.id !== stock.id)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Cet ID de stock existe déjà.',
        });
        this.onRowEditCancelStock(stock, this.stockOptions.findIndex(item => item.id === stock.id));
        return;
      }

      delete this.clonedStock[stock.id as unknown as string];
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Stock mis à jour avec succès!' });
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
        // Remove articles associated with the deleted stock
        this.stock.articles = this.stock.articles.filter(a => a.stockId !== stock.id);
        this.stockOptions = this.stockOptions.filter(s => s.id !== stock.id);
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Stock supprimé avec succès!' });
        this.calculateStats(); // Recalculate stats after deletion
      },
    });
  }
}
