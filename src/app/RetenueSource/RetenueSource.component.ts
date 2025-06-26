import { Component, OnInit } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Retraite } from '../shared/Retraite';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { RetraiteLightDto } from '../DTO/RetraiteLightDto';
import { Banque } from '../shared/Banque';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { Fournisseur } from '../shared/Fournisseur';
import { FournisseurService } from '../Services/Fournisseurs.service';
import { RetenuesService } from '../Services/Retenue.service';
import { RetenueDto } from '../DTO/RetenueDto';
import {AuthService} from '../shared/Auth.service';
import { DialogModule } from 'primeng/dialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Retenue } from '../shared/Retenue';
import { AddRetenueDTO } from '../DTO/AddRetenue';
import { ThemeService } from '../Services/theme.service';
import { Table } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-RetenueSource',
  templateUrl: './RetenueSource.component.html',
  styleUrls: ['./RetenueSource.component.css'],
  imports: [ RippleModule, ConfirmDialog , SplitButtonModule , DialogModule, AutoCompleteModule , FormsModule,DatePickerModule,InputNumberModule,DrawerModule, ContextMenuModule, MenubarModule  , ToastModule , CommonModule, Menubar, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, TagModule, ChartModule],
  providers: [ConfirmationService , MessageService],
})
export class RetenueSourceComponent implements OnInit {

  constructor(
    private retenuesService: RetenuesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private ServiceF : FournisseurService,
    private router: Router,
    public themeService: ThemeService,
  ) {
    // Subscribe to theme changes to update chart colors
    this.themeService.darkMode$.subscribe(() => {
      if (this.retenues && this.retenues.length > 0) {
        this.initCharts();
        // Force chart re-render by creating new object references
        this.montantFournisseurChartData = { ...this.montantFournisseurChartData };
        this.typeDistributionChartData = { ...this.typeDistributionChartData };
      }
    });
  }

  // Chart data and options
  montantFournisseurChartData: any;
  montantFournisseurChartOptions: any;
  typeDistributionChartData: any;
  typeDistributionChartOptions: any;

  items2: any[] = [
    { label: 'Voir Retenue', icon: 'pi pi-eye', command: () => this.viewRetenue(this.contextMenuSelection) },
    { label: 'Modifier', icon: 'pi pi-pencil', command: () => this.onRowClick(this.contextMenuSelection) },
    { 
      label: 'Supprimer', 
      icon: 'pi pi-trash', 
      command: () => this.deleteSelectedRetenues() 
    }
  ];

  
  loading = false;
  RetenuesToDelete : RetenueDto[] = [];
  items = [
    {
      label: 'Ajouter Retenue',
      icon: 'pi pi-plus',
      command: () => this.toggleAddRetenueInfo()
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash' ,  command: () => this.deleteSelectedRetenues(),
    }
  ];

 


  retenues : RetenueDto[] = [];

  ngOnInit(): void {
    // Check initial theme state
    const isDarkMode = this.themeService.isDarkMode();
    if (isDarkMode) {
      document.body.classList.add('dark');
    }

    this.fetchRetenues();
  }

  fetchRetenues(): void {
    this.loading = true;
    this.retenuesService.getRetenues().subscribe({
      next: (data) => {
        this.retenues = data;
        console.log(this.retenues)
        this.loading = false;

        // Calculate raw values
        const totalTTC = this.getTotalTTC(this.retenues);
        const averageNet = this.getAverageNet(this.retenues);
        const retenueTotal = this.getRetenueTotal(this.retenues);
        const retenueAvg = this.getAverageRetenueMontant(this.retenues);

        // Animate them
        this.animateValue('animatedTotalTTC', totalTTC);
        this.animateValue('animatedAverageNet', averageNet);
        this.animateValue('animatedRetenueTotal', retenueTotal);
        this.animateValue('animatedretenueAvg', retenueAvg); // ✅ Use same name as declared

        // Initialize charts
        this.initCharts();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les retenues.'
        });
        this.loading = false;
      }
    });

    // Fetch fournisseurs data
    this.ServiceF.getAll().subscribe(
      (data) => {
        this.fournisseursData = data;
      },
      (error) => {
        // Optional error handling
      }
    );
  }

  initCharts() {
    const isDarkMode = this.themeService.isDarkMode();
    const textColor = isDarkMode ? '#c7c5c5' : '#495057';
    const textColorSecondary = isDarkMode ? '#c7c5c5' : '#6c757d';
    const surfaceBorder = isDarkMode ? '#495057' : '#dee2e6';

    // --- CHARTS ---
    // Bar Chart: All fournisseurs by montantTTC (no limit)
    const fournisseurMap: { [key: string]: number } = {};
    this.retenues.forEach(r => {
      const key = r.fournisseurNom || 'N/A';
      fournisseurMap[key] = (fournisseurMap[key] || 0) + (r.montantTTC || 0);
    });
    let fournisseursSorted = Object.entries(fournisseurMap).sort((a, b) => b[1] - a[1]);
    let fournisseurs = fournisseursSorted.map(([name]) => name);
    let montants = fournisseursSorted.map(([, montant]) => montant);
    
    // Enhanced vibrant color palette with better contrast
    const vibrantColors = [
      '#1860a8', '#fb9332', '#10b981', '#f97316', '#8b5cf6', 
      '#6366f1', '#f472b6', '#f59e0b', '#60a5fa', '#a78bfa', 
      '#34d399', '#fdad5c', '#3386d6', '#b59dfa', '#f583bd', 
      '#fb923c', '#a3a3f7', '#818cf8', '#fbbf24', '#ef4444',
      '#06b6d4', '#84cc16', '#f97316', '#8b5cf6', '#ec4899'
    ];
    
    this.montantFournisseurChartData = {
      labels: fournisseurs,
      datasets: [
        {
          label: 'Montant TTC par Fournisseur (TND)',
          backgroundColor: fournisseurs.map((_, i) => vibrantColors[i % vibrantColors.length]),
          borderColor: fournisseurs.map((_, i) => vibrantColors[i % vibrantColors.length]),
          borderWidth: 1,
          data: montants
        }
      ]
    };
    this.montantFournisseurChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      responsive: true,
      plugins: {
        legend: { 
          labels: { 
            color: textColor,
            font: {
              size: 12
            }
          } 
        }
      },
      scales: {
        x: {
          ticks: { 
            color: textColorSecondary, 
            font: { 
              weight: 500,
              size: 11
            },
            maxRotation: 45,
            minRotation: 0
          },
          grid: { 
            color: surfaceBorder, 
            drawBorder: false 
          }
        },
        y: {
          ticks: { 
            color: textColorSecondary,
            font: {
              size: 11
            }
          },
          grid: { 
            color: surfaceBorder, 
            drawBorder: false 
          }
        }
      }
    };

    // Doughnut Chart: All types by count (no limit)
    const typeMap: { [key: string]: number } = {};
    this.retenues.forEach(r => {
      const key = r.type || 'N/A';
      typeMap[key] = (typeMap[key] || 0) + 1;
    });
    let typesSorted = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);
    let types = typesSorted.map(([name]) => name);
    let typeCounts = typesSorted.map(([, count]) => count);
    
    // Enhanced doughnut color palette with better contrast
    const doughnutColors = [
      '#fb9332', '#1860a8', '#f97316', '#10b981', '#8b5cf6', 
      '#6366f1', '#f472b6', '#f59e0b', '#60a5fa', '#a78bfa', 
      '#34d399', '#fdad5c', '#3386d6', '#b59dfa', '#f583bd', 
      '#fb923c', '#a3a3f7', '#818cf8', '#fbbf24', '#ef4444',
      '#06b6d4', '#84cc16', '#f97316', '#8b5cf6', '#ec4899'
    ];
    
    this.typeDistributionChartData = {
      labels: types,
      datasets: [
        {
          data: typeCounts,
          backgroundColor: types.map((_, i) => doughnutColors[i % doughnutColors.length]),
          hoverBackgroundColor: types.map((_, i) => doughnutColors[(i + 1) % doughnutColors.length]),
          borderWidth: 2,
          borderColor: isDarkMode ? '#2d3748' : '#ffffff'
        }
      ]
    };
    this.typeDistributionChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: { 
          labels: { 
            color: textColor,
            font: {
              size: 12
            }
          } 
        }
      }
    };
  }

  AddRetenueInfo: boolean = false;
  AddRetenue : AddRetenueDTO = new AddRetenueDTO();
  selectedFournisseur: Fournisseur | null = null;
  filteredFournisseurs: Fournisseur[] = [];
  fournisseurs: Fournisseur[] = [];

  showNumeroFactureError = false;
  showDateCreationError = false;
  showMontantTTCError = false;
  showTypeError = false;
  showRetenueError = false;
  showMontantNetError = false;
  showFournisseurError = false;



  onSubmit() {
    // Reset error flags
    this.showMontantTTCError = false;
    this.showTypeError = false;
    this.showFournisseurError = false;

    let isValid = true;

    // Validation checks
    if (
      this.AddRetenue.montantTTC === null ||
      this.AddRetenue.montantTTC === undefined ||
      this.AddRetenue.montantTTC <= 0
    ) {
      this.showMontantTTCError = true;
      isValid = false;
    }

    if (!this.AddRetenue.type || this.AddRetenue.type.trim() === '') {
      this.showTypeError = true;
      isValid = false;
    }

    if (!this.selectedFournisseur || !this.selectedFournisseur.nom) {
      this.showFournisseurError = true;
      isValid = false;
    }

    if (isValid) {
      const retenueDto: AddRetenueDTO = {
        ...this.AddRetenue,
        fournisseurId: this.selectedFournisseur?.id ?? 0
      };

      this.retenuesService.createRetenue(retenueDto).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Retenue ajoutée avec succès'
          });

          this.AddRetenueInfo = false;
          this.fetchRetenues(); // Real-time update
        },
        error: (err) => {
          console.error('Error creating retenue:', err);
        }
      });
    }
  }

  displayFournisseurDialog = false;





  // Toggle drawer visibility
  toggleAddRetenueInfo(): void {
    this.AddRetenueInfo = true;
  }

  // Toggle view dialog
  toggleDialog(): void {
      this.displayFournisseurDialog = true;
  }


    AddFournisseurInfo: boolean = false;
    toggleAddFournisseurInfo() {
      this.AddFournisseurInfo = !this.AddFournisseurInfo;
    }


    fournisseursData: Fournisseur[]  = [];


    filterFournisseurs(event: any) {
      const query = event.query.toLowerCase();
      this.filteredFournisseurs = this.fournisseursData.filter(fournisseur => 
        fournisseur.nom && fournisseur.nom.toLowerCase().includes(query) 
      );
    }
    

  showFournisseurErrors = {
    matriculeFournisseur: '', // 'empty' | 'invalid' | ''
    nom: false,
    email: false,
    telephone: false,
    adresse: false
  };

  FournisseurAjouter : Fournisseur = new Fournisseur();

  validateFournisseurForm(): boolean {
    const f = this.FournisseurAjouter;
    const matricule = f.matriculeFournisseur?.trim() || '';
    const matriculeRegex = /^[0-9]{7}[A-Z]{3}$/;

    if (!matricule) {
      this.showFournisseurErrors.matriculeFournisseur = 'empty';
    } else if (!matriculeRegex.test(matricule)) {
      this.showFournisseurErrors.matriculeFournisseur = 'invalid';
    } else {
      this.showFournisseurErrors.matriculeFournisseur = '';
    }

    this.showFournisseurErrors.nom = !f.nom?.trim();
    this.showFournisseurErrors.email = !f.email?.trim();
    this.showFournisseurErrors.telephone = !f.telephone?.trim();
    this.showFournisseurErrors.adresse = !f.adresse?.trim();

    return !(
      this.showFournisseurErrors.matriculeFournisseur ||
      this.showFournisseurErrors.nom ||
      this.showFournisseurErrors.email ||
      this.showFournisseurErrors.telephone ||
      this.showFournisseurErrors.adresse
    );
  }













  onSaveFournisseur() {
    if (this.validateFournisseurForm()) {
      this.AddFournisseur();
    }
  }

  stored = JSON.parse(localStorage.getItem('entrepriseInfo') || '{}');

  AddFournisseur() {
    const entrepriseId =this.stored.id;
    this.FournisseurAjouter.entrepriseId = entrepriseId;

    this.ServiceF.create(this.FournisseurAjouter).subscribe(
      (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Fournisseur ajouté avec succès !'
        });

        // Add the new fournisseur to the list
        this.fournisseursData.push(response);

        // Reset the form
        this.FournisseurAjouter = {
          id: 0,
          nom: '',
          email: '',
          telephone: '',
          adresse: '',
          matriculeFournisseur: '', // Ajout du champ requis
          entrepriseId: entrepriseId,
        };

        this.AddFournisseurInfo = false;
      },
      (error) => {
        console.error('Erreur lors de l\'ajout du fournisseur:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de l\'ajout du fournisseur.'
        });
      }
    );
  }


  types: string[] = ['1%', '10%', '15%'];
  filteredTypes: string[] = [];

  filterTypes(event: any) {
    const query = event.query.toLowerCase();
    this.filteredTypes = this.types.filter(type =>
      type.toLowerCase().includes(query)
    );
  }




  dialogVisible: boolean = false;
  contextMenuSelection: RetenueDto = new RetenueDto();

  viewRetenue(contextMenuSelection: RetenueDto) {
    this.router.navigate(['/ImprimerRetenue', contextMenuSelection.id]);
  }



  // Stats section
  animatedTotalTTC: number = 0;
  animatedAverageNet: number = 0;
  animatedRetenueTotal: number = 0;
  animatedretenueAvg: number = 0; 

  animateValue(property: keyof this, end: number, baseDuration = 1000) {
    const start = 0;
    const range = end - start;
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
      (this[property] as unknown as number) = parseFloat(current.toFixed(0));
    }, stepTime);
  }

  // Get total Montant TTC
  getTotalTTC(data: any[]): number {
    return data.reduce((sum, item) => sum + (item.montantTTC || 0), 0);
  }

  // Get average Montant Net
  getAverageNet(data: any[]): number {
    if (data.length === 0) return 0;
    const totalNet = data.reduce((sum, item) => sum + (item.montantNet || 0), 0);
    return totalNet / data.length;
  }

  // Get total Retenue Montant
  getRetenueTotal(data: any[]): number {
    return data.reduce((sum, item) => sum + (item.retenueMontant || 0), 0);
  }

  // Get average Retenue Montant
  getAverageRetenueMontant(data: any[]): number {
    if (data.length === 0) return 0;
    const totalRetenue = data.reduce((sum, item) => sum + (item.retenueMontant || 0), 0);
    return totalRetenue / data.length;
  }

  SelectedRetenues: RetenueDto[] = [];

  deleteSelectedRetenues(): void {
    let idsToDelete: number[] = [];

    if (this.SelectedRetenues && this.SelectedRetenues.length > 0) {
      idsToDelete = this.SelectedRetenues.map(r => r.id);
    } else if (this.contextMenuSelection) {
      idsToDelete = [this.contextMenuSelection.id];
    }

    if (idsToDelete.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucune sélection',
        detail: 'Veuillez sélectionner au moins une retenue à supprimer.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer les retenues sélectionnées ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.retenuesService.deleteRetenues(idsToDelete).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Suppression réussie',
              detail: 'Les retenues sélectionnées ont été supprimées.'
            });

            this.retenues = this.retenues.filter(r => !idsToDelete.includes(r.id));
            this.SelectedRetenues = [];
            this.fetchRetenues(); // Real-time update
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Une erreur est survenue lors de la suppression.'
            });
          }
        });
      }
    });
  }


  onDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer ce fournisseur ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.ServiceF.delete(id).subscribe({
          next: () => {
            this.fournisseurs = this.fournisseurs.filter(f => f.id !== id);
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Fournisseur supprimé avec succès'
            });
          },
          error: (err) => {
            console.error("Delete failed", err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'La suppression du fournisseur a échoué'
            });
          }
        });
      }
    });
  }

  // Add these new properties
  clonedFournisseurs: { [s: string]: Fournisseur } = {};
  editingFournisseur: Fournisseur | null = null;

  // Add these new methods
  onRowEditInit(fournisseur: Fournisseur) {
    this.clonedFournisseurs[fournisseur.id] = { ...fournisseur };
  }

  onRowEditSave(fournisseur: Fournisseur) {
    if (this.validateFournisseurEdit(fournisseur)) {
      delete this.clonedFournisseurs[fournisseur.id];
      this.ServiceF.update(fournisseur.id, fournisseur).subscribe({
        next: () => {
          const index = this.fournisseursData.findIndex(f => f.id === fournisseur.id);
          if (index !== -1) {
            this.fournisseursData[index] = { ...fournisseur };
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Fournisseur mis à jour avec succès'
          });
        },
        error: (error) => {
          console.error('Update failed:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'La mise à jour du fournisseur a échoué'
          });
        }
      });
    }
  }

  onRowEditCancel(fournisseur: Fournisseur, index: number) {
    if (this.clonedFournisseurs[fournisseur.id]) {
      this.fournisseursData[index] = { ...this.clonedFournisseurs[fournisseur.id] };
      delete this.clonedFournisseurs[fournisseur.id];
    }
  }

  validateFournisseurEdit(fournisseur: Fournisseur): boolean {
    // Skip full validation during typing/editing
    if (this.editingFournisseur !== fournisseur) {
      return true;
    }

    const matriculeRegex = /^[0-9]{7}[A-Z]{3}$/;
    
    if (!fournisseur.matriculeFournisseur || !matriculeRegex.test(fournisseur.matriculeFournisseur)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Le matricule du fournisseur doit contenir 7 chiffres suivis de 3 lettres majuscules'
      });
      return false;
    }

    if (!fournisseur.nom?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Le nom du fournisseur est requis'
      });
      return false;
    }

    if (!fournisseur.email?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'L\'email du fournisseur est requis'
      });
      return false;
    }

    if (!fournisseur.telephone?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Le téléphone du fournisseur est requis'
      });
      return false;
    }

    if (!fournisseur.adresse?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'L\'adresse du fournisseur est requise'
      });
      return false;
    }

    return true;
  }

  // Add these new properties
  updateRetenueInfo: boolean = false;
  selectedRetenue: RetenueDto | null = null;
  updateRetenue: AddRetenueDTO = new AddRetenueDTO();

  // Add this new method
  onRowClick(retenue: RetenueDto) {
    this.selectedRetenue = retenue;
    this.updateRetenue = {
      numeroFacture: retenue.numeroFacture,
      montantTTC: retenue.montantTTC,
      type: retenue.type,
      dateCreation: retenue.dateCreation,
      retenue: retenue.retenueMontant,
      montantNet: retenue.montantNet,
      fournisseurId: this.fournisseursData.find(f => f.nom === retenue.fournisseurNom)?.id || 0
    };
    this.selectedFournisseur = this.fournisseursData.find(f => f.nom === retenue.fournisseurNom) || null;
    this.updateRetenueInfo = true;
  }

  onUpdateSubmit() {
    if (!this.selectedRetenue) return;

    // Reset error flags
    this.showNumeroFactureError = false;
    this.showMontantTTCError = false;
    this.showTypeError = false;
    this.showFournisseurError = false;

    let isValid = true;
    const numeroFactureRegex = /^[0-9]{7}[A-Z]{3}$/;

    // Validation checks
    if (!this.updateRetenue.numeroFacture || !numeroFactureRegex.test(this.updateRetenue.numeroFacture.trim())) {
      this.showNumeroFactureError = true;
      isValid = false;
    }

    if (
      this.updateRetenue.montantTTC === null ||
      this.updateRetenue.montantTTC === undefined ||
      this.updateRetenue.montantTTC <= 0
    ) {
      this.showMontantTTCError = true;
      isValid = false;
    }

    if (!this.updateRetenue.type || this.updateRetenue.type.trim() === '') {
      this.showTypeError = true;
      isValid = false;
    }

    if (!this.selectedFournisseur || !this.selectedFournisseur.nom) {
      this.showFournisseurError = true;
      isValid = false;
    }

    if (isValid) {
      const retenueDto: RetenueDto = {
        ...this.selectedRetenue,
        numeroFacture: this.updateRetenue.numeroFacture,
        montantTTC: this.updateRetenue.montantTTC,
        type: this.updateRetenue.type,
        dateCreation: this.updateRetenue.dateCreation,
        retenueMontant: this.updateRetenue.retenue,
        montantNet: this.updateRetenue.montantNet,
        fournisseurNom: this.selectedFournisseur?.nom || '',
        fournisseurAdresse: this.selectedFournisseur?.adresse || '',
        fournisseurMatricule: this.selectedFournisseur?.matriculeFournisseur || '',
        entrepriseNom: this.selectedRetenue.entrepriseNom,
        entrepriseAdresse: this.selectedRetenue.entrepriseAdresse
      };

      this.retenuesService.updateRetenue(this.selectedRetenue.id, retenueDto).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Retenue mise à jour avec succès'
          });

          this.updateRetenueInfo = false;
          this.selectedRetenue = null;
          this.fetchRetenues(); // Real-time update
        },
        error: (err) => {
          console.error('Error updating retenue:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'La mise à jour de la retenue a échoué'
          });
        }
      });
    }
  }
}