import { Component, OnInit } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Client } from '../shared/Client';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ThemeService } from '../Services/theme.service';
import { ClientService } from '../Services/Client.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-Client',
  templateUrl: './Client.component.html',
  styleUrls: ['./Client.component.css'],
  standalone: true,
  imports: [ ConfirmDialog, SplitButtonModule, DialogModule, FormsModule, InputNumberModule, DrawerModule, ContextMenuModule, MenubarModule, ToastModule, CommonModule, Menubar, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, TagModule, ChartModule],
  providers: [ConfirmationService, MessageService],
})
export class ClientComponent implements OnInit {

  constructor(
    private confirmationService: ConfirmationService,
    private clientService: ClientService,
    private messageService: MessageService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  AddClientInfo: boolean = false;
  AddClient: Client = { id: 0, fullName: '', email: '', phoneNumber: '', address: '', clientCode: '', dateAjout: new Date(), entrepriseId: 0 };
  ModifyClientInfo: boolean = false;

  items2: MenuItem[] = [
    { label: 'Modifier Client', icon: 'pi pi-pencil', command: () => this.showModifyForm() },
    { label: 'Supprimer', icon: 'pi pi-trash', command: () => this.DeleteClient() },
  ];

  selectedClient: Client = { id: 0, fullName: '', email: '', phoneNumber: '', address: '', clientCode: '', dateAjout: new Date(), entrepriseId: 0 };

  clientData: Client[] = [];

  items = [
    {
      label: 'Ajouter Client',
      icon: 'pi pi-plus',
      command: () => this.toggleAddClientInfo()
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash',
      command: () => this.deleteSelectedClients()
    }
  ];

  loading: boolean = false;
  SelectedClients: Client[] = [];

  // Error flags
  showNameError = false;
  showEmailError = false;

  clientDataOriginal: any[] = []; // Store unfiltered data
  searchText: string = '';

  animatedTotalClients: number = 0;
  animatedNewClientsThisMonth: number = 0;
  animatedUniqueCities: number = 0;
  lastClientAdded: string = '';

  clientsPerMonthChartData: any;
  clientsPerMonthChartOptions: any;
  clientsByEmailDomainChartData: any;
  clientsByEmailDomainChartOptions: any;

  get hasBarData(): boolean {
    return !!(this.clientsPerMonthChartData &&
      this.clientsPerMonthChartData.datasets &&
      this.clientsPerMonthChartData.datasets[0] &&
      Array.isArray(this.clientsPerMonthChartData.datasets[0].data) &&
      this.clientsPerMonthChartData.datasets[0].data.some((v: number) => v > 0));
  }

  get hasPieData(): boolean {
    return !!(this.clientsByEmailDomainChartData &&
      this.clientsByEmailDomainChartData.datasets &&
      this.clientsByEmailDomainChartData.datasets[0] &&
      Array.isArray(this.clientsByEmailDomainChartData.datasets[0].data) &&
      this.clientsByEmailDomainChartData.datasets[0].data.some((v: number) => v > 0));
  }

  animateValue(property: keyof this, end: number, baseDuration = 1000) {
    const start = 0;
    const range = end - start;
    if (range === 0) {
      (this[property] as unknown as number) = end;
      return;
    }
    let current = start;
    const duration = Math.max(500, Math.min(2000, baseDuration * (100 / Math.max(end, 1))));
    const steps = 60;
    const stepTime = duration / steps;
    const increment = range / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      (this[property] as unknown as number) = parseFloat(current.toFixed(1));
    }, stepTime);
  }

  // Add a flag to control the button state
  isSubmitting: boolean = false;

  ngOnInit() {
    // Check initial theme state
    const isDarkMode = this.themeService.isDarkMode();
    if (isDarkMode) {
      document.body.classList.add('dark');
    }
    this.loadClients();
  }

  toggleAddClientInfo() {
    this.AddClientInfo = !this.AddClientInfo;
    this.AddClient = { id: 0, fullName: '', email: '', phoneNumber: '', address: '', clientCode: '', dateAjout: new Date(), entrepriseId: 0 };
    this.showNameError = false;
    this.showEmailError = false;
  }

  validateForm() {
    this.showNameError = false;
    this.showEmailError = false;
    if (!this.AddClient.fullName || this.AddClient.fullName.trim() === '') {
      this.showNameError = true;
    }
    if (!this.AddClient.email || this.AddClient.email.trim() === '') {
      this.showEmailError = true;
    }
    if (!this.showNameError && !this.showEmailError && !this.isSubmitting) {
      this.submitForm();
    }
  }

  submitForm() {
    this.isSubmitting = true;
    this.clientService.createClient(this.AddClient).subscribe(
      (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Client ajouté avec succès !'
        });
        this.AddClientInfo = false;
        this.loadClients(); // Reload the list from backend
        setTimeout(() => { this.isSubmitting = false; }, 5000); // 5s cooldown
      },
      (error) => {
        console.error('Error creating client:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de l\'ajout du client.'
        });
        setTimeout(() => { this.isSubmitting = false; }, 5000); // 5s cooldown
      }
    );
  }

  DeleteClient() {
    if (this.selectedClient?.id == null) {
      return;
    }
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le client ${this.selectedClient.fullName} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.clientService.deleteClient(this.selectedClient!.id).subscribe({
          next: () => {
            this.clientData = this.clientData.filter(c => c.id !== this.selectedClient!.id);
            this.clientDataOriginal = this.clientDataOriginal.filter(c => c.id !== this.selectedClient!.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Client supprimé avec succès'
            });
            this.selectedClient = { id: 0, fullName: '', email: '', phoneNumber: '', address: '', clientCode: '', dateAjout: new Date(), entrepriseId: 0 };
            // Update stats/charts
            this.updateStatsAndCharts();
          },
          error: err => {
            console.error('Error deleting client:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec de la suppression du client'
            });
          }
        });
      }
    });
  }

  deleteSelectedClients(): void {
    const idsToDelete = this.SelectedClients.map(c => c.id);
    if (idsToDelete.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucune sélection',
        detail: 'Veuillez sélectionner au moins un client à supprimer.'
      });
      return;
    }
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${idsToDelete.length} client(s) ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        const deletePromises = idsToDelete.map(id => this.clientService.deleteClient(id).toPromise());
        Promise.all(deletePromises).then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Suppression réussie',
            detail: 'Les clients sélectionnés ont été supprimés.'
          });
          this.clientData = this.clientData.filter(c => !idsToDelete.includes(c.id));
          this.clientDataOriginal = this.clientDataOriginal.filter(c => !idsToDelete.includes(c.id));
          this.SelectedClients = [];
          // Update stats/charts
          this.updateStatsAndCharts();
        }).catch(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue lors de la suppression.'
          });
        });
        this.selectedClient = { id: 0, fullName: '', email: '', phoneNumber: '', address: '', clientCode: '', dateAjout: new Date(), entrepriseId: 0 };
      }
    });
  }

  filterClients() {
    const text = this.searchText?.toLowerCase() || '';
    this.clientData = this.clientDataOriginal.filter(c =>
      Object.values(c).some(value =>
        String(value).toLowerCase().includes(text)
      )
    );
    if (this.clientData.length === 0) {
      this.selectedClient = { id: 0, fullName: '', email: '', phoneNumber: '', address: '', clientCode: '', dateAjout: new Date(), entrepriseId: 0 };
    }
  }

  showModifyForm() {
    this.ModifyClientInfo = !this.ModifyClientInfo;
  }

  ModifyClient(): void {
    if (!this.selectedClient || !this.selectedClient.id) return;
    const updatedClient: Client = {
      id: this.selectedClient.id,
      fullName: this.selectedClient.fullName?.trim() || '',
      email: this.selectedClient.email?.trim() || '',
      phoneNumber: this.selectedClient.phoneNumber?.trim() || '',
      dateAjout: this.selectedClient.dateAjout,
      address: this.selectedClient.address?.trim() || '',
      clientCode: this.selectedClient.clientCode?.trim() || '',
      entrepriseId: this.selectedClient.entrepriseId
    };
    this.clientService.updateClient(this.selectedClient.id, updatedClient).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Client modifié avec succès', life: 3000 });
        this.ModifyClientInfo = false;
        this.clientData = this.clientData.map(c => c.id === this.selectedClient.id ? { ...c, ...updatedClient } : c);
        this.clientDataOriginal = this.clientDataOriginal.map(c => c.id === this.selectedClient.id ? { ...c, ...updatedClient } : c);
        // Update stats/charts
        this.updateStatsAndCharts();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la modification', life: 3000 });
      }
    });
  }

  onRowEditInit(client: Client) {}

  onRowEditSave(client: Client) {
    this.clientService.updateClient(client.id, client).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Client modifié avec succès',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la modification',
        });
      }
    });
  }

  onRowEditCancel(client: Client, index: number) {
    this.messageService.add({
      severity: 'info',
      summary: 'Annulé',
      detail: 'Modification annulée',
    });
    this.selectedClient = { id: 0, fullName: '', email: '', phoneNumber: '', address: '', clientCode: '', dateAjout: new Date(), entrepriseId: 0 };
  }

  confirmDeleteClient(client: Client) {
    this.selectedClient = client;
    this.DeleteClient();
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clientDataOriginal = clients;
        this.clientData = clients;
        // Stats
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const totalClients = clients.length;
        const newClientsThisMonth = clients.filter(c => {
          const created = c.dateAjout ? new Date(c.dateAjout) : null;
          return created && created.getMonth() === thisMonth && created.getFullYear() === thisYear;
        }).length;
        // Unique cities (from address field, extract city if possible)
        const citySet = new Set<string>();
        clients.forEach(c => {
          if (c.address) {
            // Try to extract city: take the last word or comma-separated part
            let city = c.address.split(',').pop()?.trim() || '';
            if (city) citySet.add(city);
          }
        });
        const uniqueCities = citySet.size;
        // Last client added (by dateAjout, fallback to last in array)
        let lastClient = null;
        if (clients.length > 0) {
          lastClient = clients
            .map(c => ({...c, created: c.dateAjout ? new Date(c.dateAjout) : null}))
            .sort((a, b) => (b.created?.getTime() || 0) - (a.created?.getTime() || 0))[0];
        }
        let lastClientDisplay = lastClient ? (lastClient.fullName || lastClient.email || 'N/A') : 'N/A';
        this.animateValue('animatedTotalClients', totalClients);
        this.animateValue('animatedNewClientsThisMonth', newClientsThisMonth);
        this.animateValue('animatedUniqueCities', uniqueCities);
        this.lastClientAdded = lastClientDisplay;
        // Chart 1: Nouveaux Clients par Jour (last 14 days, line chart)
        const dayLabels: string[] = [];
        const dayCounts: number[] = [];
        const dayMap: { [key: string]: number } = {};
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
          dayLabels.push(label);
          dayMap[label] = 0;
        }
        clients.forEach(c => {
          const created = c.dateAjout ? new Date(c.dateAjout) : null;
          if (created) {
            const label = created.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            if (dayMap[label] !== undefined) dayMap[label]++;
          }
        });
        dayLabels.forEach(l => dayCounts.push(dayMap[l]));
        this.clientsPerMonthChartData = {
          labels: dayLabels,
          datasets: [
            {
              label: 'Nouveaux clients',
              backgroundColor: '#60a5fa',
              borderColor: '#60a5fa',
              fill: false,
              tension: 0.3,
              data: dayCounts
            }
          ]
        };
        this.clientsPerMonthChartOptions = {
          maintainAspectRatio: false,
          aspectRatio: 1.5,
          plugins: {
            legend: { labels: { color: this.themeService.isDarkMode() ? '#c7c5c5' : '#495057' } }
          },
          scales: {
            x: {
              ticks: { color: this.themeService.isDarkMode() ? '#c7c5c5' : '#6c757d', font: { weight: 500 } },
              grid: { color: this.themeService.isDarkMode() ? '#495057' : '#dee2e6', drawBorder: false }
            },
            y: {
              ticks: { color: this.themeService.isDarkMode() ? '#c7c5c5' : '#6c757d' },
              grid: { color: this.themeService.isDarkMode() ? '#495057' : '#dee2e6', drawBorder: false }
            }
          }
        };
        // Chart 2: Clients par Ville (doughnut, top 5 cities only)
        const cityMap: { [city: string]: number } = {};
        clients.forEach(c => {
          if (c.address) {
            let city = c.address.split(',').pop()?.trim() || '';
            if (city) cityMap[city] = (cityMap[city] || 0) + 1;
          }
        });
        let cityEntries = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);
        let topCities = cityEntries.slice(0, 5);
        let cityLabels = topCities.map(([city]) => city);
        let cityCounts = topCities.map(([, count]) => count);
        this.clientsByEmailDomainChartData = {
          labels: cityLabels,
          datasets: [
            {
              data: cityCounts,
              backgroundColor: ['#60a5fa', '#a78bfa', '#f472b6', '#f59e42', '#34d399'],
              hoverBackgroundColor: ['#79b4fa', '#b59dfa', '#f583bd', '#f5a142', '#4ade80']
            }
          ]
        };
        this.clientsByEmailDomainChartOptions = {
          maintainAspectRatio: false,
          aspectRatio: 1.5,
          cutout: '60%',
          plugins: {
            legend: { labels: { color: this.themeService.isDarkMode() ? '#c7c5c5' : '#495057' } }
          }
        };
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }

  // Helper to get ISO week number
  getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d as any) - (yearStart as any)) / 86400000 + 1) / 7);
  }

  // Add a new method to update stats and charts after local changes
  updateStatsAndCharts() {
    // Copy the stats/charts logic from loadClients, but use this.clientData
    const clients = this.clientData;
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const totalClients = clients.length;
    const newClientsThisMonth = clients.filter(c => {
      const created = c.dateAjout ? new Date(c.dateAjout) : null;
      return created && created.getMonth() === thisMonth && created.getFullYear() === thisYear;
    }).length;
    // Unique cities (from address field, extract city if possible)
    const citySet = new Set<string>();
    clients.forEach(c => {
      if (c.address) {
        let city = c.address.split(',').pop()?.trim() || '';
        if (city) citySet.add(city);
      }
    });
    const uniqueCities = citySet.size;
    // Last client added (by dateAjout, fallback to last in array)
    let lastClient = null;
    if (clients.length > 0) {
      lastClient = clients
        .map(c => ({...c, created: c.dateAjout ? new Date(c.dateAjout) : null}))
        .sort((a, b) => (b.created?.getTime() || 0) - (a.created?.getTime() || 0))[0];
    }
    let lastClientDisplay = lastClient ? (lastClient.fullName || lastClient.email || 'N/A') : 'N/A';
    this.animateValue('animatedTotalClients', totalClients);
    this.animateValue('animatedNewClientsThisMonth', newClientsThisMonth);
    this.animateValue('animatedUniqueCities', uniqueCities);
    this.lastClientAdded = lastClientDisplay;
    // Chart 1: Nouveaux Clients par Jour (last 14 days, line chart)
    const dayLabels: string[] = [];
    const dayCounts: number[] = [];
    const dayMap: { [key: string]: number } = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      dayLabels.push(label);
      dayMap[label] = 0;
    }
    clients.forEach(c => {
      const created = c.dateAjout ? new Date(c.dateAjout) : null;
      if (created) {
        const label = created.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        if (dayMap[label] !== undefined) dayMap[label]++;
      }
    });
    dayLabels.forEach(l => dayCounts.push(dayMap[l]));
    this.clientsPerMonthChartData = {
      labels: dayLabels,
      datasets: [
        {
          label: 'Nouveaux clients',
          backgroundColor: '#60a5fa',
          borderColor: '#60a5fa',
          fill: false,
          tension: 0.3,
          data: dayCounts
        }
      ]
    };
    this.clientsPerMonthChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      plugins: {
        legend: { labels: { color: this.themeService.isDarkMode() ? '#c7c5c5' : '#495057' } }
      },
      scales: {
        x: {
          ticks: { color: this.themeService.isDarkMode() ? '#c7c5c5' : '#6c757d', font: { weight: 500 } },
          grid: { color: this.themeService.isDarkMode() ? '#495057' : '#dee2e6', drawBorder: false }
        },
        y: {
          ticks: { color: this.themeService.isDarkMode() ? '#c7c5c5' : '#6c757d' },
          grid: { color: this.themeService.isDarkMode() ? '#495057' : '#dee2e6', drawBorder: false }
        }
      }
    };
    // Chart 2: Clients par Ville (doughnut, top 5 cities only)
    const cityMap: { [city: string]: number } = {};
    clients.forEach(c => {
      if (c.address) {
        let city = c.address.split(',').pop()?.trim() || '';
        if (city) cityMap[city] = (cityMap[city] || 0) + 1;
      }
    });
    let cityEntries = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);
    let topCities = cityEntries.slice(0, 5);
    let cityLabels = topCities.map(([city]) => city);
    let cityCounts = topCities.map(([, count]) => count);
    this.clientsByEmailDomainChartData = {
      labels: cityLabels,
      datasets: [
        {
          data: cityCounts,
          backgroundColor: ['#60a5fa', '#a78bfa', '#f472b6', '#f59e42', '#34d399'],
          hoverBackgroundColor: ['#79b4fa', '#b59dfa', '#f583bd', '#f5a142', '#4ade80']
        }
      ]
    };
    this.clientsByEmailDomainChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      cutout: '60%',
      plugins: {
        legend: { labels: { color: this.themeService.isDarkMode() ? '#c7c5c5' : '#495057' } }
      }
    };
  }
}
