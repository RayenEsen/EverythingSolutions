import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DevisService } from '../Services/Devis.service';
import { ArticleService } from '../Services/Article.service';
import { ClientService } from '../Services/Client.service';
import { Devis } from '../shared/Devis';
import { DevisCreateDto } from '../DTO/DevisCreateDto';
import { DevisUpdateDto } from '../DTO/DevisUpdateDto';
import { DevisWithArticlesDto } from '../DTO/DevisResponseDto';
import { Article } from '../shared/Article';
import { Client } from '../shared/Client';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { MenubarModule } from 'primeng/menubar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ThemeService } from '../Services/theme.service';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-Devis',
  templateUrl: './Devis.component.html',
  styleUrls: ['./Devis.component.css'],
  providers: [MessageService, ConfirmationService],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    MultiSelectModule,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    ToastModule,
    FormsModule,
    ChartModule,
    MenubarModule,
    IconFieldModule,
    InputIconModule,
    ContextMenuModule,
    ConfirmDialog,
    InputTextModule
  ]
})
export class DevisComponent implements OnInit {
  devisList: DevisWithArticlesDto[] = [];
  filteredDevisList: DevisWithArticlesDto[] = [];
  articles: Article[] = [];
  loading = false;

  // Stats
  totalDevis = 0;
  totalHT = 0;
  totalTTC = 0;
  animatedTotalDevis = 0;
  animatedTotalHT = 0;
  animatedTotalTTC = 0;

  // Charts
  devisBarChartData: any;
  devisBarChartOptions: any;
  devisDoughnutChartData: any;
  devisDoughnutChartOptions: any;
  devisLineChartData: any;
  devisLineChartOptions: any;
  devisPolarChartData: any;
  devisPolarChartOptions: any;

  // Modal dialog state
  addDialog = false;
  newDevis: DevisCreateDto = { code: '', devisArticles: [], clientId: 0 };
  selectedArticles: { article: Article, quantite: number, remise: number }[] = [];
  selectedArticle: Article | null = null;
  availableArticles: Article[] = [];
  clients: Client[] = [];
  selectedClient: Client | null = null;
  selectedDevis: DevisWithArticlesDto | null = null;
  SelectedDevis: DevisWithArticlesDto[] = [];
  


  // Menubar and search
  items = [
    {
      label: 'Ajouter Devis',
      icon: 'pi pi-plus',
      command: () => this.navigateToCreateDevis()
    },
    {
      label: 'Exporter en Excel',
      icon: 'pi pi-file-excel',
      command: () => this.exportExcel()
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash',
      command: () => this.deleteSelectedDevis()
    }
  ];
  searchText: string = '';

  contextMenuItems = [
    {
      label: 'Modifier',
      icon: 'pi pi-pencil',
      command: () => this.selectedDevis && this.editDevis(this.selectedDevis)
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash',
      command: () => this.selectedDevis && this.confirmDeleteDevis(this.selectedDevis)
    }
  ];

  constructor(
    private devisService: DevisService,
    private articleService: ArticleService,
    private clientService: ClientService,
    private messageService: MessageService,
    public themeService: ThemeService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.themeService.darkMode$?.subscribe(() => {
      this.initCharts();
      this.devisBarChartData = { ...this.devisBarChartData };
      this.devisDoughnutChartData = { ...this.devisDoughnutChartData };
      this.devisLineChartData = { ...this.devisLineChartData };
      this.devisPolarChartData = { ...this.devisPolarChartData };
    });
  }

  ngOnInit() {
    this.loadDevis();
    this.loadArticles();
    this.loadClients();
  }

  loadDevis() {
    this.loading = true;
    this.devisService.getAll().subscribe({
      next: devis => {
        // Parse dates properly and ensure all properties are set
        this.devisList = devis.map(d => ({
          ...d,
          dateCreation: new Date(d.dateCreation).toISOString()
        }));
        this.filteredDevisList = this.devisList;
        this.calculateStats();
        this.initCharts();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadArticles() {
    this.articleService.getArticles().subscribe({
      next: articles => { 
        this.articles = articles; 
        this.updateAvailableArticles();
      },
      error: () => {}
    });
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: clients => { 
        this.clients = clients; 
      },
      error: () => {}
    });
  }

  animateValue(property: keyof this, end: number, baseDuration = 1000) {
    const start = 0;
    const range = end - start;
    if (range === 0) {
      (this[property] as unknown as number) = end;
      return;
    }
    let current = start;
    const duration = Math.max(500, Math.min(2000, baseDuration * (100 / Math.max(Math.abs(end), 1))));
    const steps = 60;
    const stepTime = duration / steps;
    const increment = range / steps;
    const timer = setInterval(() => {
      current += increment;
      if ((range > 0 && current >= end) || (range < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      (this[property] as unknown as number) = parseFloat(current.toFixed(1));
    }, stepTime);
  }

  editDevis(devis: DevisWithArticlesDto) {
    console.log('=== EDITING DEVIS ===');
    console.log('Full devis object:', devis);
    console.log('Devis clientId:', devis.clientId);
    console.log('Devis clientName:', devis.clientName);
    console.log('Devis articles:', devis.devisArticles);
    
    this.selectedDevis = devis;
    this.addDialog = true;
    
    // Set the basic devis data first
    this.newDevis = {
      code: devis.code,
      devisArticles: devis.devisArticles.map(da => ({
        articleId: da.articleId,
        quantite: da.quantite,
        remise: da.remise
      })),
      clientId: devis.clientId
    };
    
    // Set selected client immediately if we have the data
    if (this.clients.length > 0) {
      console.log('Clients already loaded:', this.clients);
      console.log('Looking for client with ID:', devis.clientId);
      
      // Try to find client by ID first
      this.selectedClient = this.clients.find(c => c.id === Number(devis.clientId)) || null;
      
      // If not found by ID, try to find by name
      if (!this.selectedClient && devis.clientName) {
        console.log('Client not found by ID, trying to find by name:', devis.clientName);
        this.selectedClient = this.clients.find(c => c.fullName === devis.clientName) || null;
      }
      
      console.log('Found selected client:', this.selectedClient);
      
      // If client not found but devis has client info, create a temporary client object
      if (!this.selectedClient && devis.clientName) {
        console.log('Creating fallback client object');
        this.selectedClient = {
          id: devis.clientId || 1, // Use 1 as fallback if clientId is 0
          fullName: devis.clientName,
          email: '',
          phoneNumber: '',
          address: ''
        } as Client;
      }
    } else {
      // Load clients first, then set selected client
      console.log('Loading clients...');
      this.clientService.getClients().subscribe({
        next: clients => {
          console.log('Clients loaded:', clients);
          this.clients = clients;
          
          // Try to find client by ID first
          this.selectedClient = clients.find(c => c.id === Number(devis.clientId)) || null;
          
          // If not found by ID, try to find by name
          if (!this.selectedClient && devis.clientName) {
            console.log('Client not found by ID, trying to find by name:', devis.clientName);
            this.selectedClient = clients.find(c => c.fullName === devis.clientName) || null;
          }
          
          console.log('Found selected client after loading:', this.selectedClient);
          
          // If client not found but devis has client info, create a temporary client object
          if (!this.selectedClient && devis.clientName) {
            console.log('Creating fallback client object after loading');
            this.selectedClient = {
              id: devis.clientId || 1, // Use 1 as fallback if clientId is 0
              fullName: devis.clientName,
              email: '',
              phoneNumber: '',
              address: ''
            } as Client;
          }
          this.cdr.detectChanges();
        }
      });
    }
    
    // Set selected articles immediately if we have the data
    if (this.articles.length > 0) {
      console.log('Articles already loaded, setting selected articles');
      this.setSelectedArticles(devis);
      this.updateAvailableArticles();
      console.log('Selected articles after setting:', this.selectedArticles);
    } else {
      // Load articles first, then set selected articles
      console.log('Loading articles...');
      this.articleService.getArticles().subscribe({
        next: articles => {
          console.log('Articles loaded:', articles);
          this.articles = articles;
          this.setSelectedArticles(devis);
          this.updateAvailableArticles();
          console.log('Selected articles after loading:', this.selectedArticles);
          this.cdr.detectChanges();
        }
      });
    }
    
    this.selectedArticle = null;
  }

  private setSelectedArticles(devis: DevisWithArticlesDto) {
    console.log('Setting selected articles for devis:', devis);
    console.log('Available articles:', this.articles);
    console.log('Devis articles:', devis.devisArticles);
    
    this.selectedArticles = devis.devisArticles.map(da => {
      console.log('Processing article:', da);
      const fullArticle = this.articles.find(a => a.id === da.articleId);
      console.log('Found full article:', fullArticle);
      
      if (fullArticle) {
        return {
          article: fullArticle,
          quantite: da.quantite,
          remise: da.remise
        };
      } else {
        // Fallback if article not found in loaded articles
        console.log('Creating fallback article for:', da);
        const fallbackArticle = { 
          id: da.articleId, 
          designation: da.designation || `Article ${da.articleId}`, 
          code: '', 
          prixVenteHT: da.pU_HTVA || 0, 
          prixVenteTTC: (da.pU_HTVA || 0) * 1.19 
        } as Article;
        
        return {
          article: fallbackArticle,
          quantite: da.quantite,
          remise: da.remise
        };
      }
    });
    
    console.log('Final selected articles:', this.selectedArticles);
  }

  updateAvailableArticles() {
    // For editing mode, we want to show all articles including the selected ones
    this.availableArticles = [...this.articles];
  }

  onSingleArticleSelect(event: any) {
    const article = event.value as Article;
    if (article) {
      // Just update the available articles and sync, don't add new articles
      this.updateAvailableArticles();
      this.syncNewDevisArticles();
    }
  }

  addNewArticleLine() {
    console.log('=== ADDING NEW ARTICLE LINE ===');
    console.log('Current selectedArticles before:', this.selectedArticles);
    console.log('Array length before:', this.selectedArticles.length);
    
    // Add a new empty article line
    const newArticleLine = {
      article: null as any,
      quantite: 1,
      remise: 0
    };
    
    this.selectedArticles.push(newArticleLine);
    
    console.log('New article line added:', newArticleLine);
    console.log('Current selectedArticles after:', this.selectedArticles);
    console.log('Array length after:', this.selectedArticles.length);
    
    this.updateAvailableArticles();
    this.syncNewDevisArticles();
    
    // Force change detection
    this.cdr.detectChanges();
    
    console.log('=== END ADDING NEW ARTICLE LINE ===');
  }

  navigateToCreateDevis() {
    this.router.navigate(['/Devis/nouveau']);
  }

  removeArticle(index: number) {
    this.selectedArticles.splice(index, 1);
    this.updateAvailableArticles();
    this.syncNewDevisArticles();
  }

  onArticleQtyChange(article: Article | null, quantite: number) {
    if (!article) return; // Skip if article is null
    const idx = this.selectedArticles.findIndex(a => a.article && a.article.id === article.id);
    if (idx !== -1) {
      this.selectedArticles[idx].quantite = quantite;
      this.syncNewDevisArticles();
    }
  }

  onArticleRemiseChange(article: Article | null, remise: number) {
    if (!article) return; // Skip if article is null
    const idx = this.selectedArticles.findIndex(a => a.article && a.article.id === article.id);
    if (idx !== -1) {
      this.selectedArticles[idx].remise = remise;
      this.syncNewDevisArticles();
    }
  }

  syncNewDevisArticles() {
    this.newDevis.devisArticles = this.selectedArticles
      .filter(a => a.article) // Only include articles that have been selected
      .map(a => ({
        articleId: a.article!.id,
        quantite: a.quantite,
        remise: a.remise
      }));
  }

  saveDevis() {
    if (!this.newDevis.devisArticles.length) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Sélectionnez au moins un article.' });
      return;
    }
    if (!this.selectedClient) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Sélectionnez un client.' });
      return;
    }
    
    if (this.selectedDevis) {
      const updateDto: DevisUpdateDto = {
        code: this.newDevis.code,
        devisArticles: this.newDevis.devisArticles,
        clientId: this.selectedClient.id,
        clientName: this.selectedClient.fullName
      };
      
      console.log('Updating devis with data:', updateDto);
      this.devisService.update(this.selectedDevis.id, updateDto).subscribe({
        next: (response) => {
          console.log('Update success response:', response);
          // Backend returns a success message string, so we need to reload the data
          this.loadDevis(); // Reload all devis data
          this.addDialog = false;
          this.selectedDevis = null;
          this.selectedClient = null;
          const message = typeof response === 'string' ? response : 'Devis modifié avec succès.';
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: message });
        },
        error: (error) => {
          console.error('Update error in component:', error);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la modification du devis.' });
        }
      });
    }
  }

  calculateStats() {
    const totalDevis = this.devisList.length;
    const totalHT = this.devisList.reduce((sum, d) => sum + d.devisArticles.reduce((sumArt, da) => sumArt + (da.mT_HTVA || 0), 0), 0);
    const totalTTC = totalHT * 1.19; // Assuming 19% TVA
    this.animateValue('animatedTotalDevis', totalDevis);
    this.animatedTotalHT = 0;
    this.animateValue('animatedTotalHT', totalHT);
    this.animatedTotalTTC = 0;
    this.animateValue('animatedTotalTTC', totalTTC);
  }

  filterDevis() {
    const text = this.searchText?.toLowerCase() || '';
    this.filteredDevisList = this.devisList.filter(d =>
      d.code.toLowerCase().includes(text) ||
      d.entrepriseId.toString().includes(text) ||
      new Date(d.dateCreation).toLocaleDateString('fr-FR').includes(text) ||
      (d.clientName && d.clientName.toLowerCase().includes(text)) ||
      d.clientId.toString().includes(text) ||
      d.devisArticles.some(da =>
        (da.designation || '').toLowerCase().includes(text) ||
        da.articleId.toString().includes(text) ||
        da.pU_HTVA?.toString().includes(text) ||
        da.mT_HTVA?.toString().includes(text)
      )
    );
  }

  // --- Charts ---
  initCharts() {
    const isDarkMode = this.themeService.isDarkMode && this.themeService.isDarkMode();
    const textColor = isDarkMode ? '#c7c5c5' : '#495057';
    const textColorSecondary = isDarkMode ? '#c7c5c5' : '#6c757d';
    const surfaceBorder = isDarkMode ? '#495057' : '#dee2e6';
    const palette = [
      '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#f87171', '#38bdf8', '#facc15', '#818cf8', '#fb7185', '#4ade80', '#f59e42', '#6366f1', '#eab308', '#14b8a6', '#f43f5e', '#22d3ee', '#a3e635', '#fcd34d', '#c084fc'
    ];

    // Bar Chart: Top 10 Devis by Revenue (TTC)
    const sortedDevis = [...this.devisList].sort((a, b) => {
      const totalA = a.devisArticles.reduce((sum, da) => sum + (da.mT_HTVA || 0), 0) * 1.19;
      const totalB = b.devisArticles.reduce((sum, da) => sum + (da.mT_HTVA || 0), 0) * 1.19;
      return totalB - totalA;
    }).slice(0, 10);

    const barLabels = sortedDevis.map(d => `${d.code} (#${d.id})`);
    const barData = sortedDevis.map(d => {
      const totalHT = d.devisArticles.reduce((sum, da) => sum + (da.mT_HTVA || 0), 0);
      return totalHT * 1.19; // TTC
    });

    this.devisBarChartData = {
      labels: barLabels,
      datasets: [
        {
          label: 'Revenue TTC',
          data: barData,
          backgroundColor: barLabels.map((_, i) => palette[i % palette.length]),
          borderColor: barLabels.map((_, i) => palette[i % palette.length]),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };

    this.devisBarChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 5,
          right: 5,
          bottom: 5,
          left: 5
        }
      },
      plugins: {
        legend: { 
          display: false,
          labels: { color: textColor } 
        },
        tooltip: { 
          titleColor: textColor, 
          bodyColor: textColor, 
          footerColor: textColor,
          backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
          borderColor: surfaceBorder,
          borderWidth: 1,
          callbacks: {
            title: function(context: any) {
              return `Devis: ${context[0].label}`;
            },
            label: function(context: any) {
              return `Revenue TTC: ${context.parsed.y.toFixed(2)} TND`;
            },
            afterLabel: function(context: any) {
              const devis = sortedDevis[context.dataIndex];
              const totalHT = devis.devisArticles.reduce((sum, da) => sum + (da.mT_HTVA || 0), 0);
              const articleCount = devis.devisArticles.length;
              const avgRemise = devis.devisArticles.reduce((sum, da) => sum + da.remise, 0) / articleCount;
              return [
                `Revenue HT: ${totalHT.toFixed(2)} TND`,
                `Articles: ${articleCount}`,
                `Remise moyenne: ${avgRemise.toFixed(1)}%`
              ];
            }
          }
        }
      },
      scales: {
        x: { 
          ticks: { 
            color: textColorSecondary, 
            font: { weight: 500 },
            maxRotation: 45,
            minRotation: 45
          }, 
          grid: { color: surfaceBorder, drawBorder: false } 
        },
        y: { 
          ticks: { 
            color: textColorSecondary,
            callback: function(value: any) {
              return value.toFixed(0) + ' TND';
            }
          }, 
          grid: { color: surfaceBorder, drawBorder: false },
          title: {
            display: true,
            text: 'Revenue (TND)',
            color: textColorSecondary
          }
        }
      }
    };

    // Line Chart: Revenue Trend by Date
    const dateSortedDevis = [...this.devisList].sort((a, b) => 
      new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime()
    );

    const lineLabels = dateSortedDevis.map(d => new Date(d.dateCreation).toLocaleDateString('fr-FR'));
    const lineData = dateSortedDevis.map(d => {
      const totalHT = d.devisArticles.reduce((sum, da) => sum + (da.mT_HTVA || 0), 0);
      return totalHT * 1.19; // TTC
    });

    this.devisLineChartData = {
      labels: lineLabels,
      datasets: [
        {
          label: 'Revenue TTC',
          data: lineData,
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#60a5fa',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };

    this.devisLineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 5,
          right: 5,
          bottom: 5,
          left: 5
        }
      },
      plugins: {
        legend: { 
          display: false,
          labels: { color: textColor } 
        },
        tooltip: { 
          titleColor: textColor, 
          bodyColor: textColor,
          backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
          borderColor: surfaceBorder,
          borderWidth: 1,
          callbacks: {
            label: function(context: any) {
              return `Revenue: ${context.parsed.y.toFixed(2)} TND`;
            }
          }
        }
      },
      scales: {
        x: { 
          ticks: { color: textColorSecondary, font: { weight: 500 } }, 
          grid: { color: surfaceBorder, drawBorder: false } 
        },
        y: { 
          ticks: { 
            color: textColorSecondary,
            callback: function(value: any) {
              return value.toFixed(0) + ' TND';
            }
          }, 
          grid: { color: surfaceBorder, drawBorder: false },
          title: {
            display: true,
            text: 'Revenue (TND)',
            color: textColorSecondary
          }
        }
      }
    };

    // Polar Area Chart: Revenue Distribution by Remise Categories
    const remiseCategories = [
      { name: '0-5%', min: 0, max: 5, color: '#10b981' },
      { name: '6-10%', min: 6, max: 10, color: '#f59e0b' },
      { name: '11-15%', min: 11, max: 15, color: '#f97316' },
      { name: '16-20%', min: 16, max: 20, color: '#ef4444' },
      { name: '20%+', min: 21, max: 100, color: '#dc2626' }
    ];

    const remiseData = remiseCategories.map(category => {
      return this.devisList.reduce((total, devis) => {
        const devisTotal = devis.devisArticles.reduce((sum, da) => {
          if (da.remise >= category.min && da.remise <= category.max) {
            return sum + (da.mT_HTVA || 0);
          }
          return sum;
        }, 0);
        return total + devisTotal;
      }, 0);
    });

    const remiseLabels = remiseCategories.map(cat => cat.name);
    const remiseColors = remiseCategories.map(cat => cat.color);

    this.devisPolarChartData = {
      labels: remiseLabels,
      datasets: [
        {
          data: remiseData,
          backgroundColor: remiseColors.map(color => color + '80'), // Add transparency
          borderColor: remiseColors,
          borderWidth: 2
        }
      ]
    };

    this.devisPolarChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 5,
          right: 5,
          bottom: 5,
          left: 5
        }
      },
      plugins: { 
        legend: { 
          position: 'bottom',
          labels: { 
            color: textColor,
            padding: 10,
            usePointStyle: true,
            pointStyle: 'circle'
          } 
        },
        tooltip: {
          backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
          borderColor: surfaceBorder,
          borderWidth: 1,
          callbacks: {
            label: function(context: any) {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed.toFixed(2)} TND (${percentage}%)`;
            }
          }
        }
      },
      scales: {
        r: {
          ticks: {
            color: textColorSecondary,
            callback: function(value: any) {
              return value.toFixed(0) + ' TND';
            }
          },
          grid: {
            color: surfaceBorder
          },
          pointLabels: {
            color: textColorSecondary
          }
        }
      }
    };
  }

  // Helper method to adjust color brightness
  private adjustBrightness(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  get hasBarData(): boolean {
    return !!(this.devisBarChartData &&
      this.devisBarChartData.datasets &&
      this.devisBarChartData.datasets[0] &&
      Array.isArray(this.devisBarChartData.datasets[0].data) &&
      this.devisBarChartData.datasets[0].data.some((v: number) => v > 0));
  }

  get hasLineData(): boolean {
    return !!(this.devisLineChartData &&
      this.devisLineChartData.datasets &&
      this.devisLineChartData.datasets[0] &&
      Array.isArray(this.devisLineChartData.datasets[0].data) &&
      this.devisLineChartData.datasets[0].data.some((v: number) => v > 0));
  }

  get hasPolarData(): boolean {
    return !!(this.devisPolarChartData &&
      this.devisPolarChartData.datasets &&
      this.devisPolarChartData.datasets[0] &&
      Array.isArray(this.devisPolarChartData.datasets[0].data) &&
      this.devisPolarChartData.datasets[0].data.some((v: number) => v > 0));
  }

  async exportExcel() {
    if (!this.devisList.length) {
      this.messageService.add({ severity: 'warn', summary: 'Aucun devis', detail: 'Aucun devis à exporter.' });
      return;
    }
    const XLSX = await import('xlsx');
    const wsData = [
      ['ID', 'Code', 'Entreprise ID', 'Date Création', 'Articles', 'Total HT', 'Total TTC'],
      ...this.devisList.map(d => {
        const totalHT = d.devisArticles.reduce((sum, da) => sum + (da.mT_HTVA || 0), 0);
        const totalTTC = totalHT * 1.19;
        return [
          d.id,
          d.code,
          d.entrepriseId,
          new Date(d.dateCreation).toLocaleDateString('fr-FR'),
          d.devisArticles.map(da => `${da.designation || 'Article ' + da.articleId} (x${da.quantite}, ${da.remise}% remise, PU: ${da.pU_HTVA}TND, MT: ${da.mT_HTVA}TND)`).join(' | '),
          totalHT,
          totalTTC
        ];
      })
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Devis');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devis_export.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.messageService.add({ severity: 'success', summary: 'Export', detail: 'Export Excel terminé.' });
  }

  confirmDeleteDevis(devis: DevisWithArticlesDto) {
    this.selectedDevis = devis;
    this.DeleteDevis();
  }

  DeleteDevis() {
    if (!this.selectedDevis?.id) return;
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le devis #${this.selectedDevis.id} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.devisService.delete(this.selectedDevis!.id).subscribe({
          next: () => {
            this.devisList = this.devisList.filter(d => d.id !== this.selectedDevis!.id);
            this.filteredDevisList = this.filteredDevisList.filter(d => d.id !== this.selectedDevis!.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Devis supprimé avec succès'
            });
            this.selectedDevis = null;
            this.calculateStats();
            this.initCharts();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression du devis.' });
          }
        });
      }
    });
  }

  deleteSelectedDevis() {
    const idsToDelete = this.SelectedDevis.map(d => d.id);
    if (idsToDelete.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucune sélection',
        detail: 'Veuillez sélectionner au moins un devis à supprimer.'
      });
      return;
    }
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${idsToDelete.length} devis ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        const deleteObservables = idsToDelete.map(id => this.devisService.delete(id));
        Promise.all(deleteObservables.map(obs => obs.toPromise())).then(() => {
          this.devisList = this.devisList.filter(d => !idsToDelete.includes(d.id));
          this.filteredDevisList = this.filteredDevisList.filter(d => !idsToDelete.includes(d.id));
          this.SelectedDevis = [];
          this.calculateStats();
          this.initCharts();
          this.messageService.add({ severity: 'success', summary: 'Suppression réussie', detail: 'Les devis sélectionnés ont été supprimés.' });
        }).catch(() => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression.' });
        });
      }
    });
  }

  getTotalQuantity(): number {
    return this.selectedArticles.reduce((sum, sa) => sum + sa.quantite, 0);
  }

  getEstimatedTotal(): number {
    return this.selectedArticles.reduce((sum, sa) => {
      if (!sa.article) return sum; // Skip if article is null
      return sum + ((sa.article.prixVenteTTC || 0) * sa.quantite * (1 - sa.remise / 100));
    }, 0);
  }

  getLineTotal(article: Article, quantite: number, remise: number): number {
    return (article.prixVenteTTC || 0) * quantite * (1 - remise / 100);
  }

  getDevisTotalHT(devis: DevisWithArticlesDto): number {
    return devis.devisArticles.reduce((sum, da) => sum + (da.mT_HTVA || 0), 0);
  }

  getDevisTotalTTC(devis: DevisWithArticlesDto): number {
    return this.getDevisTotalHT(devis) * 1.19; // Assuming 19% TVA
  }

  getTotalQuantityForDevis(devis: DevisWithArticlesDto): number {
    return devis.devisArticles?.reduce((total, article) => total + article.quantite, 0) || 0;
  }

  getAverageRemiseForDevis(devis: DevisWithArticlesDto): number {
    if (!devis.devisArticles || devis.devisArticles.length === 0) return 0;
    const totalRemise = devis.devisArticles.reduce((total, article) => total + article.remise, 0);
    return totalRemise / devis.devisArticles.length;
  }

  getSelectedArticlesCount(): number {
    return this.selectedArticles.filter(sa => sa.article).length;
  }



  viewDevis(devis: DevisWithArticlesDto) {
    // Navigate to ImprimerDevisComponent with the devis ID
    this.router.navigate(['/ImprimerDevis', devis.id]);
  }
}
