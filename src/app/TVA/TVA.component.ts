import { Component, OnInit } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { TVA } from '../shared/TVA';
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
import { TVAService } from '../Services/TVA.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-TVA',
  templateUrl: './TVA.component.html',
  styleUrls: ['./TVA.component.css'],
  standalone: true,
  imports: [ ConfirmDialog, SplitButtonModule, DialogModule, FormsModule, InputNumberModule, DrawerModule, ContextMenuModule, MenubarModule, ToastModule, CommonModule, Menubar, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, TagModule, ChartModule],
  providers: [ConfirmationService, MessageService],
})
export class TVAComponent implements OnInit {

  constructor(
    private confirmationService: ConfirmationService,
    private tvaService: TVAService,
    private messageService: MessageService,
    private router: Router,
    public themeService: ThemeService
  ) {
    // Subscribe to theme changes to update chart colors
    this.themeService.darkMode$.subscribe(() => {
      if (this.tvaData && this.tvaData.length > 0) {
        this.initCharts();
        // Force chart re-render by creating new object references
        this.tvaDistributionChartData = { ...this.tvaDistributionChartData };
        this.tvaCategoryChartData = { ...this.tvaCategoryChartData };
      }
    });
  }

  AddTVAInfo: boolean = false;
  AddTVA: TVA = { id: 0, code: '', taux: 0 };
  ModifyTVAInfo: boolean = false;

  items2: MenuItem[] = [
    { label: 'Modifier TVA', icon: 'pi pi-pencil', command: () => this.showModifyForm() },
    { label: 'Supprimer', icon: 'pi pi-trash', command: () => this.DeleteTVA() },
  ];

  selectedTVA: TVA = { id: 0, code: '', taux: 0 };

  tvaData: TVA[] = [];

  items = [
    {
      label: 'Ajouter TVA',
      icon: 'pi pi-plus',
      command: () => this.toggleAddTVAInfo()
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash',
      command: () => this.deleteSelectedTVAs()
    }
  ];

  loading: boolean = false;
  SelectedTVAs: TVA[] = [];

  // Error flags
  showCodeError = false;
  showTauxError = false;

  tvaDistributionChartData: any;
  tvaDistributionChartOptions: any;
  tvaCategoryChartData: any;
  tvaCategoryChartOptions: any;

  tvaDataOriginal: any[] = []; // Store unfiltered data
  searchText: string = '';

  ngOnInit() {
    // Check initial theme state
    const isDarkMode = this.themeService.isDarkMode();
    if (isDarkMode) {
      document.body.classList.add('dark');
    }

    this.loadTVAs();
  }

  toggleAddTVAInfo() {
    this.AddTVAInfo = !this.AddTVAInfo;
    this.AddTVA = { id: 0, code: '', taux: 0 }; // Reset form
    this.showCodeError = false;
    this.showTauxError = false;
  }

  validateForm() {
    // Reset errors
    this.showCodeError = false;
    this.showTauxError = false;

    // Validate code
    if (!this.AddTVA.code || this.AddTVA.code.trim() === '') {
      this.showCodeError = true;
    }

    // Validate taux
    if (this.AddTVA.taux === undefined || this.AddTVA.taux < 0) {
      this.showTauxError = true;
    }

    // If all valid, submit form
    if (!this.showCodeError && !this.showTauxError) {
      this.submitForm();
    }
  }

  submitForm() {
    // Call the service to create the TVA
    this.tvaService.postTVA(this.AddTVA).subscribe(
      (response) => {
        this.tvaData.push(response); // Add the new TVA to the list
        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'TVA ajoutée avec succès !'
        });

        // Reset or close the form
        this.AddTVAInfo = false;
        this.loadTVAs();
      },
      (error) => {
        console.error('Error creating TVA:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de l\'ajout de la TVA.'
        });
      }
    );
  }

  DeleteTVA() {
    if (this.selectedTVA?.id == null) {
      return;
    }

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer la TVA ${this.selectedTVA.code} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.tvaService.deleteTVA(this.selectedTVA!.id).subscribe({
          next: () => {
            // 1) Remove from local list
            this.tvaData = this.tvaData.filter(t => t.id !== this.selectedTVA!.id);

            // 2) Show success message
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'TVA supprimée avec succès'
            });
            
            // Optionally clear selection
            this.selectedTVA = { id: 0, code: '', taux: 0 };
            this.loadTVAs();
          },
          error: err => {
            console.error('Error deleting TVA:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec de la suppression de la TVA'
            });
          }
        });
      }
    });
  }

  deleteSelectedTVAs(): void {
    const idsToDelete = this.SelectedTVAs.map(t => t.id);

    if (idsToDelete.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucune sélection',
        detail: 'Veuillez sélectionner au moins une TVA à supprimer.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${idsToDelete.length} TVA(s) ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        // Delete each TVA individually since there's no bulk delete endpoint
        const deletePromises = idsToDelete.map(id => this.tvaService.deleteTVA(id).toPromise());
        
        Promise.all(deletePromises).then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Suppression réussie',
            detail: 'Les TVAs sélectionnées ont été supprimées.'
          });

          // Filter TVAs locally
          this.tvaData = this.tvaData.filter(
            t => !idsToDelete.includes(t.id)
          );

          this.SelectedTVAs = [];
          this.loadTVAs();
        }).catch(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue lors de la suppression.'
          });
        });
      }
    });
  }

  filterTVAs() {
    const text = this.searchText?.toLowerCase() || '';
    this.tvaData = this.tvaDataOriginal.filter(t =>
      Object.values(t).some(value =>
        String(value).toLowerCase().includes(text)
      )
    );
  }

  showModifyForm() {
    console.log(this.selectedTVA);
    this.ModifyTVAInfo = !this.ModifyTVAInfo;
  }

  ModifyTVA(): void {
    console.log(this.selectedTVA);
    if (!this.selectedTVA || !this.selectedTVA.id) return;

    const updatedTVA: TVA = {
      id: this.selectedTVA.id,
      code: this.selectedTVA.code?.trim() || '',
      taux: this.selectedTVA.taux ?? 0,
    };

    this.tvaService.putTVA(this.selectedTVA.id, updatedTVA).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'TVA modifiée avec succès', life: 3000 });
        this.ModifyTVAInfo = false;
        this.loadTVAs();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la modification', life: 3000 });
      }
    });
  }

  onRowEditInit(tva: TVA) {
    // Optionally store original value if you want to restore it on cancel
    // this.clonedTVAs[tva.id] = { ...tva };
  }

  onRowEditSave(tva: TVA) {
    this.tvaService.putTVA(tva.id, tva).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'TVA modifiée avec succès',
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

  onRowEditCancel(tva: TVA, index: number) {
    // If you cloned original, restore here
    // this.tvaData[index] = this.clonedTVAs[tva.id];
    this.messageService.add({
      severity: 'info',
      summary: 'Annulé',
      detail: 'Modification annulée',
    });
  }

  confirmDeleteTVA(tva: TVA) {
    this.selectedTVA = tva;
    this.DeleteTVA();
  }

  //Stats section
  animatedTotalTVAs: number = 0;
  animatedAverageTaux: number = 0;
  animatedHighestRate: number = 0;

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

  getTotalTVAs(tvas: any[]): number {
    return tvas.length;
  }

  getAverageTaux(tvas: any[]): number {
    if (tvas.length === 0) return 0;
    const total = tvas.reduce((sum, tva) => sum + tva.taux, 0);
    return total / tvas.length;
  }

  getHighestTaux(tvas: any[]): number {
    if (tvas.length === 0) return 0;
    return Math.max(...tvas.map(t => t.taux));
  }

  loadTVAs() {
    this.tvaService.getTVAs().subscribe({
      next: (tvas) => {
        this.tvaDataOriginal = tvas;
        this.tvaData = tvas;
        const totalTVAs = this.getTotalTVAs(this.tvaData);
        const avgTaux = this.getAverageTaux(this.tvaData);
        const highestRate = this.getHighestTaux(this.tvaData);

        this.animateValue('animatedTotalTVAs', totalTVAs);
        this.animateValue('animatedAverageTaux', avgTaux);
        this.animateValue('animatedHighestRate', highestRate);
        
        this.initCharts();
      },
      error: (err) => {
        console.error('Error fetching TVAs:', err);
      }
    });
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const isDarkMode = this.themeService.isDarkMode();

    const textColor = isDarkMode ? '#c7c5c5' : '#495057';
    const textColorSecondary = isDarkMode ? '#c7c5c5' : '#6c757d';
    const surfaceBorder = isDarkMode ? '#495057' : '#dee2e6';

    // Chart 1: TVA Rate Distribution (Bar Chart)
    const tvaRates = this.tvaData.map(t => t.taux);
    const tvaLabels = this.tvaData.map(t => t.code);

    this.tvaDistributionChartData = {
        labels: tvaLabels,
        datasets: [
            {
                label: 'Taux de TVA (%)',
                backgroundColor: '#60a5fa',
                borderColor: '#60a5fa',
                data: tvaRates
            }
        ]
    };

    this.tvaDistributionChartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 1.5,
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
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
    
    // Chart 2: TVA Categories (Doughnut)
    const categories = {
      reduced: this.tvaData.filter(t => t.taux > 0 && t.taux < 10).length,
      standard: this.tvaData.filter(t => t.taux >= 10 && t.taux <= 20).length,
      high: this.tvaData.filter(t => t.taux > 20).length,
    };

    this.tvaCategoryChartData = {
      labels: ['Taux Réduit (<10%)', 'Taux Standard (10-20%)', 'Taux Élevé (>20%)'],
      datasets: [
        {
          data: [categories.reduced, categories.standard, categories.high],
          backgroundColor: [
            '#60a5fa',
            '#a78bfa',
            '#f472b6'
          ],
          hoverBackgroundColor: [
            '#79b4fa',
            '#b59dfa',
            '#f583bd'
          ]
        }
      ]
    };
    
    this.tvaCategoryChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      cutout: '60%',
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    };
  }
}
