import { Component, OnInit } from '@angular/core';
import { StockService } from '../Services/Stock.service';
import { Stock } from '../shared/Stock';
import { Article } from '../shared/Article';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ThemeService } from '../Services/theme.service';
import { AddStock } from '../DTO/AddStock';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import * as XLSX from 'xlsx';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-Stock',
  templateUrl: './Stock.component.html',
  styleUrls: ['./Stock.component.css'],
  standalone: true,
  imports: [
    TableModule, CommonModule, FormsModule, DrawerModule, MenubarModule, ToastModule,
    ContextMenuModule, ButtonModule, ConfirmDialogModule, ChartModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class StockComponent implements OnInit {
  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  loading = false;
  error: string | null = null;
  searchText: string = '';
  expandedRows: { [key: number]: boolean } = {};
  addStockDrawer: boolean = false;
  editStockDrawer: boolean = false;
  newStock: AddStock = { name: '', code: '' };
  editStock: Stock | null = null;
  menuItems: any[] = [
    {
      label: 'Ajouter Stock',
      icon: 'pi pi-plus',
      command: () => this.addStockDrawer = true
    },
    {
      label: 'Exporter Excel',
      icon: 'pi pi-file-excel',
      command: () => this.exportToExcel()
    },
    {
      label: 'Supprimer la sélection',
      icon: 'pi pi-trash',
      command: () => this.deleteSelectedStocks()
    }
  ];
  contextMenuItems: any[] = [
    {
      label: 'Modifier',
      icon: 'pi pi-pencil',
      command: (event: any) => {
        if (this.selectedStock) this.openEditDrawer(this.selectedStock);
      }
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash',
      command: (event: any) => {
        if (this.selectedStock) this.deleteStock(this.selectedStock);
      }
    }
  ];
  selectedStocks: Stock[] = [];
  selectedStock: Stock | null = null;
  // Chart data for articles per stock
  articlesPieData: any;
  articlesPieOptions: any;
  topStocksBarData: any;
  topStocksBarOptions: any;
  articlesLineData: any;
  articlesLineOptions: any;

  constructor(
    private stockService: StockService,
    private messageService: MessageService,
    public themeService: ThemeService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.fetchStocks();
  }

  fetchStocks() {
    this.loading = true;
    this.error = null;
    this.stockService.getStocksWithArticles().subscribe({
      next: (data) => {
        this.stocks = data.map(stock => ({
          ...stock,
          articles: Array.isArray(stock.articles) ? stock.articles : []
        }));
        this.filteredStocks = this.stocks;
        this.updateCharts();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des stocks';
        this.loading = false;
      }
    });
  }

  getTotalArticles(): number {
    return this.stocks.reduce((sum, stock) => sum + (stock.articles?.length || 0), 0);
  }

  filterStocks() {
    const text = this.searchText.toLowerCase();
    this.filteredStocks = this.stocks.filter(stock =>
      stock.name.toLowerCase().includes(text) ||
      stock.code.toLowerCase().includes(text)
    );
  }

  onRowExpand(event: any) {
    this.expandedRows[event.data.id] = true;
  }

  onRowCollapse(event: any) {
    this.expandedRows[event.data.id] = false;
  }

  isRowExpanded(stock: Stock): boolean {
    return !!this.expandedRows[stock.id];
  }

  onAddStock() {
    if (!this.newStock.name.trim() || !this.newStock.code.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Veuillez remplir tous les champs.' });
      return;
    }
    this.stockService.postStock(this.newStock).subscribe({
      next: (created) => {
        this.addStockDrawer = false;
        this.newStock = { name: '', code: '' };
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Stock ajouté avec succès.' });
        this.fetchStocks();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'ajout du stock.' });
      }
    });
  }

  openEditDrawer(stock: Stock | null) {
    if (!stock) return;
    this.editStock = { ...stock };
    this.editStockDrawer = true;
  }

  onEditStock() {
    if (!this.editStock || !this.editStock.name.trim() || !this.editStock.code.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Veuillez remplir tous les champs.' });
      return;
    }
    this.stockService.putStock(this.editStock.id, this.editStock).subscribe({
      next: () => {
        this.editStockDrawer = false;
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Stock modifié avec succès.' });
        this.fetchStocks();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la modification du stock.' });
      }
    });
  }

  deleteStock(stock: Stock | null) {
    if (!stock) return;
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le stock "${stock.name}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.stockService.deleteStock(stock.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Stock supprimé avec succès.' });
            this.fetchStocks();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression du stock.' });
          }
        });
      }
    });
  }

  deleteSelectedStocks() {
    if (!this.selectedStocks.length) {
      this.messageService.add({ severity: 'warn', summary: 'Aucune sélection', detail: 'Veuillez sélectionner au moins un stock à supprimer.' });
      return;
    }
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${this.selectedStocks.length} stock(s) ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const ids = this.selectedStocks.map(s => s.id);
        // Assume a batch delete endpoint, otherwise delete one by one
        // this.stockService.deleteStocks(ids).subscribe(...)
        // For now, delete one by one:
        let deleted = 0;
        ids.forEach(id => {
          this.stockService.deleteStock(id).subscribe({
            next: () => {
              this.stocks = this.stocks.filter(s => s.id !== id);
              this.filteredStocks = this.stocks;
              deleted++;
              if (deleted === ids.length) {
                this.selectedStocks = [];
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Stocks supprimés avec succès.' });
              }
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression d\'un stock.' });
            }
          });
        });
      }
    });
  }

  exportToExcel() {
    const data = this.stocks.map(stock => ({
      'Nom du Stock': stock.name,
      'Code': stock.code,
      "Nombre d'articles": stock.articles.length
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stocks');
    XLSX.writeFile(wb, 'stocks.xlsx');
  }

  exportStockToExcel(stock: Stock) {
    const data = stock.articles.map(article => ({
      'Stock': stock.name,
      'Code Article': article.code,
      'Désignation': article.designation,
      'Prix Achat HT': article.prixAchatHT,
      'Prix Vente HT': article.prixVenteHT,
      'TVA': article.tva?.taux,
      'Gouvernerat': article.gouvernerat,
      'Prix Vente TTC': article.prixVenteTTC,
      'Marge': article.marge
    }));
    if (data.length === 0) {
      this.messageService.add({ severity: 'info', summary: 'Aucun article', detail: `Le stock "${stock.name}" ne contient aucun article à exporter.` });
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, stock.name);
    XLSX.writeFile(wb, `stock_${stock.name}.xlsx`);
  }

  getMostPopulatedStock(): Stock | null {
    if (!this.stocks.length) return null;
    return this.stocks.reduce((max, s) => (s.articles.length > max.articles.length ? s : max), this.stocks[0]);
  }

  getLeastPopulatedStock(): Stock | null {
    if (!this.stocks.length) return null;
    return this.stocks.reduce((min, s) => (s.articles.length < min.articles.length ? s : min), this.stocks[0]);
  }

  updateCharts() {
    // TVA-inspired color logic
    const isDarkMode = this.themeService.isDarkMode();
    const textColor = isDarkMode ? '#c7c5c5' : '#495057';
    const textColorSecondary = isDarkMode ? '#c7c5c5' : '#6c757d';
    const surfaceBorder = isDarkMode ? '#495057' : '#dee2e6';
    // Pie chart: Articles per Stock
    const pieLabels = this.stocks.map(s => s.name);
    const pieData = this.stocks.map(s => s.articles?.length || 0);
    this.articlesPieData = {
      labels: pieLabels,
      datasets: [
        {
          data: pieData,
          backgroundColor: [
            '#60a5fa',
            '#a78bfa',
            '#f472b6',
            '#fbbf24',
            '#34d399',
            '#f87171'
          ],
          hoverBackgroundColor: [
            '#79b4fa',
            '#b59dfa',
            '#f583bd',
            '#fcd34d',
            '#6ee7b7',
            '#fca5a5'
          ]
        }
      ]
    };
    this.articlesPieOptions = {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        title: {
          color: textColor
        },
        tooltip: {
          titleColor: textColor,
          bodyColor: textColor,
          footerColor: textColor
        }
      }
    };
    // Bar chart: Top 5 stocks by article count
    const sortedStocks = [...this.stocks].sort((a, b) => (b.articles?.length || 0) - (a.articles?.length || 0)).slice(0, 5);
    const barLabels = sortedStocks.map(s => s.name);
    const barData = sortedStocks.map(s => s.articles?.length || 0);
    this.topStocksBarData = {
      labels: barLabels,
      datasets: [
        {
          label: 'Articles',
          data: barData,
          backgroundColor: '#60a5fa',
          borderColor: '#60a5fa',
          borderWidth: 1
        }
      ]
    };
    this.topStocksBarOptions = {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        title: {
          color: textColor
        },
        tooltip: {
          titleColor: textColor,
          bodyColor: textColor,
          footerColor: textColor
        }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary, font: { weight: 500 } },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };
    // Line chart: Average Purchase Price (HT) per Stock
    const avgPrixAchatLabels = this.stocks.map(s => s.name);
    const avgPrixAchatData = this.stocks.map(s => {
      if (!s.articles || s.articles.length === 0) return 0;
      const sum = s.articles.reduce((acc, a) => acc + (a.prixAchatHT || 0), 0);
      return +(sum / s.articles.length).toFixed(2);
    });
    this.articlesLineData = {
      labels: avgPrixAchatLabels,
      datasets: [
        {
          label: 'Prix Achat Moyen par Stock',
          data: avgPrixAchatData,
          fill: false,
          borderColor: '#60a5fa',
          tension: 0.4,
          backgroundColor: '#60a5fa',
          pointBackgroundColor: '#a78bfa',
          pointBorderColor: '#a78bfa',
        }
      ]
    };
    this.articlesLineOptions = {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        },
        title: {
          color: textColor
        },
        tooltip: {
          titleColor: textColor,
          bodyColor: textColor,
          footerColor: textColor
        }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary, font: { weight: 500 } },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };
  }

  get hasPieData(): boolean {
    return !!(this.articlesPieData && this.articlesPieData.datasets && this.articlesPieData.datasets[0] && Array.isArray(this.articlesPieData.datasets[0].data) && this.articlesPieData.datasets[0].data.some((v: number) => v > 0));
  }

  get hasBarData(): boolean {
    return !!(this.topStocksBarData && this.topStocksBarData.datasets && this.topStocksBarData.datasets[0] && Array.isArray(this.topStocksBarData.datasets[0].data) && this.topStocksBarData.datasets[0].data.some((v: number) => v > 0));
  }

  get hasLineData(): boolean {
    return !!(this.articlesLineData && this.articlesLineData.datasets && this.articlesLineData.datasets[0] && Array.isArray(this.articlesLineData.datasets[0].data) && this.articlesLineData.datasets[0].data.some((v: number) => v > 0));
  }
}
