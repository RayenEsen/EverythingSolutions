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
import { AddRetraiteDTO } from '../DTO/AddRetrait';
import { FournisseurService } from '../Services/Fournisseurs.service';
import { BanquesService } from '../Services/Banques.service';
import { RetraitesService } from '../Services/Trait.service';
import {AuthService} from '../shared/Auth.service';
import { DialogModule } from 'primeng/dialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ThemeService } from '../Services/theme.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-Retrait',
  templateUrl: './Retrait.component.html',
  styleUrls: ['./Retrait.component.css'],
  standalone: true,
  imports: [ ConfirmDialog, SplitButtonModule, DialogModule, AutoCompleteModule, FormsModule, DatePickerModule, InputNumberModule, DrawerModule, ContextMenuModule, MenubarModule, ToastModule, CommonModule, Menubar, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, TagModule, ChartModule],
  providers: [ConfirmationService, MessageService],
})
export class RetraitComponent implements OnInit {
  todayDate: string | undefined;

  // Chart data and options
  montantFournisseurChartData: any;
  montantFournisseurChartOptions: any;
  banqueDistributionChartData: any;
  banqueDistributionChartOptions: any;
  traitesPerMonthChartData: any;
  traitesPerMonthChartOptions: any;

  constructor(
    private confirmationService: ConfirmationService,
    private ServiceA: AuthService,
    private ServiceR: RetraitesService,
    private ServiceB: BanquesService,
    private ServiceF: FournisseurService,
    private messageService: MessageService,
    private router: Router,
    public themeService: ThemeService
  ) {
    // Subscribe to theme changes to update chart colors
    this.themeService.darkMode$.subscribe(() => {
      if (this.retraitesLightData && this.retraitesLightData.length > 0) {
        this.initCharts();
        // Force chart re-render by creating new object references
        this.montantFournisseurChartData = { ...this.montantFournisseurChartData };
        this.banqueDistributionChartData = { ...this.banqueDistributionChartData };
        this.traitesPerMonthChartData = { ...this.traitesPerMonthChartData };
      }
    });
  }

  AddRetraitInfo : boolean = false;
  AddRetrait : AddRetraiteDTO  = new AddRetraiteDTO();
  ModifyTraiteInfo: boolean = false;

  items2: any[] = [
    { label: 'Voir Traite', icon: 'pi pi-eye', command: () => this.NavigateToRetraiteDetails(this.selectedRetrait!) },
    { label: 'Modifier Traite', icon: 'pi pi-pencil', command: () => this.showModifyForm() },
    { label: 'Supprimer', icon: 'pi pi-trash', command: () => this.DeleteRetrait() },
  ];

  items4: any[] = [];

  selectedRetrait: Retraite = new Retraite();

  selectedBank: Banque | null = null;
  selected: Banque | null = null;
  filteredBanks: Banque[] = [];
  filteredFournisseurs: Fournisseur[] = [];
  selectedFournisseur: Fournisseur | null = null;

  retraitesLightData: RetraiteLightDto[] = [
    
  ];

  items = [
    {
      label: 'Ajouter Traite',
      icon: 'pi pi-plus',
      command: () => this.toggleAddRetraitInfo()
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash',
      command: () => this.deleteSelectedRetraites()
    }
  ];

  loading: boolean = false;
  fournisseursData: Fournisseur[]  = [];
  banquesData: Banque[] = [];

  ngOnInit() {
    // Check initial theme state
    const isDarkMode = this.themeService.isDarkMode();
    if (isDarkMode) {
      document.body.classList.add('dark');
    }

    // Get employee ID directly from localStorage
    const employeeId = localStorage.getItem('employeeId');
    console.log('Employee ID =', employeeId);

    this.loadTraites();

    // Fetch fournisseurs data
    this.ServiceF.getAll().subscribe(
      (data) => {
        this.fournisseursData = data;
      },
      (error) => {
        // handle error if needed
      }
    );

    // Fetch banques data
    this.ServiceB.getAll().subscribe(
      (data: Banque[]) => {
        this.banquesData = data;
        console.log('Banques fetched successfully:', this.banquesData);
      },
      (error) => {
        console.error('Error fetching banques data:', error);
      }
    );

    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }

  getFormattedEcheance(date: any): string {
    if (!date) return 'N/A';

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return 'Date invalide';

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return new Intl.DateTimeFormat('fr-FR', options).format(parsedDate);
  }

  toggleAddRetraitInfo() {
    this.AddRetraitInfo = !this.AddRetraitInfo;
  }

  selectedDate: Date = new Date(); // Defaults to today
  
  // Error flags
  showMontantError = false;
  showChequeError = false;
  showDateError = false;
  showFournisseurError = false;
  showBankError = false;
  showAddressError = false;
  showRibError = false;

  validateForm() {
    // Reset errors
    this.showMontantError = false;
    this.showChequeError = false;
    this.showDateError = false;
    this.showFournisseurError = false;
    this.showBankError = false;
    this.showAddressError = false;

    // Validate amount
    if (this.AddRetrait.montant === undefined || this.AddRetrait.montant <= 0) {
      this.showMontantError = true;
    }

    // Validate cheque number
    if (!this.AddRetrait.numCheque || this.AddRetrait.numCheque.trim() === '') {
      this.showChequeError = true;
    }

    // Validate date
    if (!this.AddRetrait.dateEcheance) {
      this.showDateError = true;
    }

    // Validate fournisseur
    if (!this.selectedFournisseur) {
      this.showFournisseurError = true;
    }

    // Validate bank
    if (!this.selectedBank) {
      this.showBankError = true;
    }

    // If all valid, submit form
    if (
      !this.showMontantError &&
      !this.showChequeError &&
      !this.showDateError &&
      !this.showFournisseurError &&
      !this.showBankError &&
      !this.showAddressError &&
      !this.showRibError
    ) {
      const formData: AddRetraiteDTO = {
        numCheque: this.AddRetrait.numCheque.trim(),
        dateEcheance: this.AddRetrait.dateEcheance,
        montant: parseFloat(this.AddRetrait.montant.toString()),
        fournisseurId: this.selectedFournisseur?.id || 0,
        banqueId: this.selectedBank?.id || 0,
        entrepriseId: +(localStorage.getItem('employeeId') ?? 0),
      };
      
      this.submitForm(formData);
    }
  }

  submitForm(data: any) {
    data.entrepriseId =  this.stored?.id;
    this.ServiceR.createRetraite(data).subscribe(
      (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Retraite ajoutée avec succès !'
        });
        this.AddRetraitInfo = false;
        // Add to local arrays
        this.retraitesLightData = [response, ...this.retraitesLightData];
        this.retraitesLightDataOriginal = [response, ...this.retraitesLightDataOriginal];
        this.updateStatsAndCharts();
      },
    );
    this.AddRetraitInfo = false;
  }

  items3: any[] | undefined;

  filterBanks(event: any) {
    const query = event.query.toLowerCase();
    this.filteredBanks = this.banquesData.filter(bank => 
      bank.nom.toLowerCase().includes(query) 
    );
  }
  
  filterFournisseurs(event: any) {
    const query = event.query.toLowerCase();
    this.filteredFournisseurs = this.fournisseursData.filter(fournisseur => 
      fournisseur.nom && fournisseur.nom.toLowerCase().includes(query) 
    );
  }
  
  DeleteRetrait() {
    if (this.selectedRetrait?.id == null) {
      return;
    }
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer la traite ${this.selectedRetrait.numeroCheque} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.ServiceR.deleteRetraite(this.selectedRetrait!.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Retraite supprimée avec succès'
            });
            const deletedId = this.selectedRetrait.id;
            this.retraitesLightData = this.retraitesLightData.filter(r => r.id !== deletedId);
            this.retraitesLightDataOriginal = this.retraitesLightDataOriginal.filter(r => r.id !== deletedId);
            this.selectedRetrait = new Retraite;
            this.updateStatsAndCharts();
          },
          error: err => {
            console.error('Error deleting retraite:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec de la suppression de la retraite'
            });
          }
        });
      }
    });
  }

  AddBanqueInfo: boolean = false;
  toggleAddBanqueInfo() {
    this.AddBanqueInfo = !this.AddBanqueInfo;
  }
  AddFournisseurInfo: boolean = false;
  toggleAddFournisseurInfo() {
    this.AddFournisseurInfo = !this.AddFournisseurInfo;
  }

  FournisseurAjouter : Fournisseur = new Fournisseur();
  banque : Banque = new Banque();

  stored = JSON.parse(localStorage.getItem('entrepriseInfo') || '{}');
  AddBanque() {
    const entrepriseId = this.stored?.id
    this.banque.entrepriseId = entrepriseId;
    console.log(this.banque)
    this.ServiceB.create(this.banque).subscribe(
      (response) => {
        // Ajout à la liste
        this.banquesData.push(response);

        // Message de succès
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Banque ajoutée avec succès !'
        });

        // Réinitialiser le formulaire
        this.banque = {
          id: 0,
          nom: '',
          adresse: '',
          rib: '',
          entrepriseId: 0
        };

        // Fermer le drawer
        this.AddBanqueInfo = false;
      },
      (error) => {
        console.error('Erreur lors de l\'ajout de la banque:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de l\'ajout de la banque.'
        });
      }
    );
  }

  showNomBanqueError = false;
  showAdresseError = false;

  validateBanqueForm(): boolean {
    console.log(this.selectedBank);
    this.showNomBanqueError = !this.banque.nom?.trim();
    this.showAdresseError = !this.banque.adresse?.trim();

    return !this.showNomBanqueError && !this.showAdresseError;
  }

  onSaveBanque() {
    if (this.validateBanqueForm()) {
      this.AddBanque();
    }
  }

  showFournisseurErrors = {
    matriculeFournisseur: '', // 'empty' | 'invalid' | ''
    nom: false,
    email: false,
    telephone: false,
    adresse: false
  };

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
  
  AddFournisseur() {
    const entrepriseId = this.stored?.id
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
          matriculeFournisseur: '',
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

  dialogVisible: boolean = false;
  toggleDialog() {
    this.dialogVisible = !this.dialogVisible; 
  }

  dialogVisibleBanque: boolean = false;
  toggleDialogBanque() {
    this.dialogVisibleBanque = !this.dialogVisibleBanque; 
  }

  item5: MenuItem[] = [];

  openMenu(event: Event, fournisseur: Fournisseur, menu: any) {
    this.item5 = [
      {
        label: 'Modifier',
        icon: 'pi pi-pencil',
      },
      {
        label: 'Supprimer',
        icon: 'pi pi-trash',
        command: () => this.confirmDeleteFournisseur(fournisseur)
      }
    ];
    menu.toggle(event);
  }

  selectedFournisseurToDelete: Fournisseur = new Fournisseur()
  ConfirmFournisseurDialog: boolean = false;
  // Pour les fournisseurs
  confirmDeleteFournisseur(fournisseur: Fournisseur) {
    this.selectedFournisseurToDelete = fournisseur;
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le fournisseur ${fournisseur.nom} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.ServiceF.delete(this.selectedFournisseurToDelete.id).subscribe({
          next: () => {
            this.loadTraites(); // Reload the list of retraites
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Fournisseur supprimé avec succès'
            });
            this.fournisseursData = this.fournisseursData.filter(f => f.id !== fournisseur.id);
          },
          error: (error) => {
            console.error('Erreur lors de la suppression du fournisseur', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de supprimer le fournisseur'
            });
          }
        });
      }
    });
  }

  // Déclaration des propriétés
  ConfirmBanqueDialog: boolean = false;
  selectedBanqueToDelete: Banque | null = null;

  // Pour les banques
  confirmDeleteBanque(banque: Banque) {
    this.selectedBanqueToDelete = banque;
    // Ne pas définir ConfirmBanqueDialog = true ici
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer la banque ${banque.nom} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.ServiceB.delete(banque.id).subscribe({
          next: () => {
            this.loadTraites(); // Reload the list of retraites
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Banque supprimée avec succès'
            });
            // Remove from local array to update UI immediately
            this.banquesData = this.banquesData.filter(b => b.id !== banque.id);
          },
          error: (error) => {
            console.error('Erreur lors de la suppression de la banque', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de supprimer la banque'
            });
          }
        });
      }
    });
  }

  NavigateToRetraiteDetails(retrait: Retraite) {
    this.router.navigate(['/RetraitDetails', retrait.id]);
  }

  banques: string[] = [
    "Amen Bank",
    "Al Baraka Bank Tunisie",
    "Arab Banking Corporation (ABC)",
    "Arab Tunisian Bank (ATB)",
    "Attijari Bank",
    "BBFPME",
    "Banque de l'Habitat (BH Bank)",
    "Banque de Tunisie (BT)",
    "Banque de Tunisie et des Émirats (BTE)",
    "Banque Franco Tunisienne (BFT)",
    "Banque Internationale Arabe de Tunisie (BIAT)",
    "Banque Nationale Agricole (BNA)",
    "Banque Tuniso-Koweïtienne (BTK)",
    "Banque Tuniso-Libyenne (BTL)",
    "Banque Tunisienne de Solidarité (BTS)",
    "Banque Zitouna",
    "CitiBank Tunisie",
    "La Poste Tunisienne (Office National des Postes)",
    "North Africa International Bank (NAIB)",
    "Qatar National Bank Tunisie (QNB)",
    "Société Tunisienne de Banque (STB)",
    "Tunis International Bank (TIB)",
    "Tunisian Foreign Bank (TFB)",
    "Tunisian Saudi Bank (TSB)",
    "Union Bancaire pour le Commerce et l'Industrie (UBCI)",
    "Union Internationale de Banques (UIB)",
    "Wifak International Bank (WIB)"
  ];

  filteredBanques: string[] = [];

  filterBanques(event: { query: string }) {
    const query = event.query.toLowerCase();
    this.filteredBanques = this.banques.filter(banque =>
      banque.toLowerCase().includes(query)
    );
  }

  SelectedTraits: Retraite[] = [];
 
  deleteSelectedRetraites(): void {
    const idsToDelete = this.SelectedTraits.map(r => r.id);
    if (idsToDelete.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucune sélection',
        detail: 'Veuillez sélectionner au moins une retraite à supprimer.'
      });
      return;
    }
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${idsToDelete.length} traite(s) ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-raised',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.ServiceR.deleteRetraites(idsToDelete).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Suppression réussie',
              detail: 'Les retraites sélectionnées ont été supprimées.'
            });
            this.retraitesLightData = this.retraitesLightData.filter(r => !idsToDelete.includes(r.id));
            this.retraitesLightDataOriginal = this.retraitesLightDataOriginal.filter(r => !idsToDelete.includes(r.id));
            this.SelectedTraits = [];
            this.updateStatsAndCharts();
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

  retraitesLightDataOriginal: any[] = []; // Store unfiltered data
  searchText: string = '';

  filterRetraites() {
    const text = this.searchText?.toLowerCase() || '';
    this.retraitesLightData = this.retraitesLightDataOriginal.filter(r =>
      Object.values(r).some(value =>
        String(value).toLowerCase().includes(text)
      )
    );
  }

  showModifyForm() {
    console.log(this.selectedRetrait)
    this.ModifyTraiteInfo = !this.ModifyTraiteInfo;
  }

  ModifyTraite(): void {
    if (!this.selectedRetrait || !this.selectedRetrait.id) return;
    const updatedRetraite: AddRetraiteDTO = {
      numCheque: this.selectedRetrait.numeroCheque?.trim() || '',
      dateEcheance: this.selectedRetrait.dateEcheance,
      montant: this.selectedRetrait.montant ?? 0,
      fournisseurId: this.selectedFournisseur?.id || 0,
      banqueId: this.selectedBank?.id || null,
      entrepriseId: this.stored?.id,
    };
    this.ServiceR.updateRetraite(this.selectedRetrait.id, updatedRetraite).subscribe({
      next: (updated) => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Traite modifiée avec succès', life: 3000 });
        this.ModifyTraiteInfo = false;
        // Update in local arrays
        this.retraitesLightData = this.retraitesLightData.map(r => r.id === this.selectedRetrait.id ? Object.assign(new RetraiteLightDto(), r, updated) : r);
        this.retraitesLightDataOriginal = this.retraitesLightDataOriginal.map(r => r.id === this.selectedRetrait.id ? Object.assign(new RetraiteLightDto(), r, updated) : r);
        this.updateStatsAndCharts();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la modification', life: 3000 });
      }
    });
  }

  dateEcheance: string = '';

  get dateEcheanceFormatted(): string {
    if (!this.selectedRetrait?.dateEcheance) return '';
    const d = new Date(this.selectedRetrait.dateEcheance);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  set dateEcheanceFormatted(value: string) {
    this.selectedRetrait.dateEcheance = value ? new Date(value) : null;
  }

  onRowEditInit(banque: Banque) {
    // Optionally store original value if you want to restore it on cancel
    // this.clonedBanques[banque.id] = { ...banque };
  }

  onRowEditSave(banque: Banque) {
    this.ServiceB.update(banque.id, banque).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Banque modifiée avec succès',
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

  onRowEditCancel(banque: Banque, index: number) {
    // If you cloned original, restore here
    // this.banquesData[index] = this.clonedBanques[banque.id];
    this.messageService.add({
      severity: 'info',
      summary: 'Annulé',
      detail: 'Modification annulée',
    });
  }

  onRowEditInitFournisseur(fournisseur: Fournisseur) {
    // Optional: keep a clone if cancel needs to restore
    // this.clonedFournisseurs[fournisseur.id] = { ...fournisseur };
  }

  onRowEditSaveFournisseur(fournisseur: Fournisseur) {
    const matriculeRegex = /^[0-9]{7}[A-Z]{3}$/;

    if (!matriculeRegex.test(fournisseur.matriculeFournisseur || '')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Format invalide',
        detail: 'Le matricule doit être au format 1234567ABC',
      });
      return;
    }

    this.ServiceF.update(fournisseur.id, fournisseur).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Fournisseur modifié avec succès',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la modification du fournisseur',
        });
      },
    });
  }

  onRowEditCancelFournisseur(fournisseur: Fournisseur, index: number) {
    // Optional: restore original from clone
    // this.fournisseursData[index] = this.clonedFournisseurs[fournisseur.id];
    this.messageService.add({
      severity: 'info',
      summary: 'Annulé',
      detail: 'Modification annulée',
    });
  }

  //Stats section

  animatedTotalAmount: number = 0;
  animatedAverageAmount: number = 0;
  animatedPendingCount: number = 0;
  animatedUniqueBanks: number = 0;

  animateValue(property: keyof this, end: number, baseDuration = 1000) {
    const start = 0;
    const range = end - start;
    let current = start;

    // Calculate duration based on magnitude: small numbers take longer, large numbers faster
    const duration = Math.max(500, Math.min(2000, baseDuration * (100 / Math.max(end, 1))));
    const steps = 60; // total steps for smoother animation
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

  getTotalAmount(traites: any[]): number {
    return traites.length
  }

  getAverageAmount(traites: any[]): number {
    return traites.reduce((total, traite) => total + traite.montant, 0);
  }
  getPendingCount(traites: any[]): number {
    const today = new Date();
    return traites.filter(traite => {
      const dateEcheance = new Date(traite.dateEcheance);
      return !isNaN(dateEcheance.getTime()) && dateEcheance > today;
    }).length;
  }

  getUniqueBanks(traites: any[]): number {
    const banks = new Set();
    traites.forEach(traite => banks.add(traite.banqueNom));
    return banks.size;
  }

  loadTraites() {
    this.ServiceR.getRetraites().subscribe({
      next: (retraites) => {
        this.retraitesLightDataOriginal = retraites;
        this.retraitesLightData = retraites;
        const totalAmount = this.getTotalAmount(this.retraitesLightData);
        const avgAmount = this.getAverageAmount(this.retraitesLightData);
        const pending = this.getPendingCount(this.retraitesLightData);
        const banks = this.getUniqueBanks(this.retraitesLightData);

        this.animateValue('animatedTotalAmount', totalAmount);
        this.animateValue('animatedAverageAmount', avgAmount);
        this.animateValue('animatedPendingCount', pending);
        this.animateValue('animatedUniqueBanks', banks);

        this.initCharts();
      },
      error: (err) => {
        console.error('Error fetching retraites:', err);
      }
    });
  }

  initCharts() {
    const isDarkMode = this.themeService.isDarkMode();
    const textColor = isDarkMode ? '#c7c5c5' : '#495057';
    const textColorSecondary = isDarkMode ? '#c7c5c5' : '#6c757d';
    const surfaceBorder = isDarkMode ? '#495057' : '#dee2e6';

    // 1. Bar Chart: Montant par Fournisseur
    const fournisseurMap: { [key: string]: number } = {};
    this.retraitesLightData.forEach(r => {
      const key = r.fournisseurNom || 'N/A';
      fournisseurMap[key] = (fournisseurMap[key] || 0) + (r.montant || 0);
    });
    // Sort fournisseurs by montant descending and take top 5
    let fournisseursSorted = Object.entries(fournisseurMap).sort((a, b) => b[1] - a[1]);
    let topFournisseurs = fournisseursSorted.slice(0, 5);
    let autresFournisseurTotal = fournisseursSorted.slice(5).reduce((sum, [, montant]) => sum + montant, 0);
    let fournisseurs = topFournisseurs.map(([name]) => name);
    let montants = topFournisseurs.map(([, montant]) => montant);
    if (fournisseursSorted.length > 5) {
      fournisseurs.push('Autres');
      montants.push(autresFournisseurTotal);
    }
    // Vibrant color palette
    const vibrantColors = [
      '#1860a8', '#fb9332', '#10b981', '#f97316', '#8b5cf6', '#6366f1', '#f472b6', '#f59e0b', '#60a5fa', '#a78bfa', '#34d399', '#fdad5c', '#3386d6', '#b59dfa', '#f583bd', '#fb923c', '#a3a3f7', '#818cf8', '#fbbf24'
    ];
    this.montantFournisseurChartData = {
      labels: fournisseurs,
      datasets: [
        {
          label: 'Montant total par Fournisseur (TND)',
          backgroundColor: fournisseurs.map((_, i) => vibrantColors[i % vibrantColors.length]),
          borderColor: fournisseurs.map((_, i) => vibrantColors[i % vibrantColors.length]),
          data: montants
        }
      ]
    };
    this.montantFournisseurChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      plugins: {
        legend: { labels: { color: textColor } }
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

    // 2. Doughnut Chart: Répartition par Banque
    const banqueMap: { [key: string]: number } = {};
    this.retraitesLightData.forEach(r => {
      const key = r.banqueNom || 'N/A';
      banqueMap[key] = (banqueMap[key] || 0) + 1;
    });
    // Sort banques by count descending and take top 5
    let banquesSorted = Object.entries(banqueMap).sort((a, b) => b[1] - a[1]);
    let topBanques = banquesSorted.slice(0, 5);
    let autresBanqueTotal = banquesSorted.slice(5).reduce((sum, [, count]) => sum + count, 0);
    let banques = topBanques.map(([name]) => name);
    let banqueCounts = topBanques.map(([, count]) => count);
    if (banquesSorted.length > 5) {
      banques.push('Autres');
      banqueCounts.push(autresBanqueTotal);
    }
    // Vibrant palette for doughnut
    const doughnutColors = [
      '#fb9332', '#1860a8', '#f97316', '#10b981', '#8b5cf6', '#6366f1', '#f472b6', '#f59e0b', '#60a5fa', '#a78bfa', '#34d399', '#fdad5c', '#3386d6', '#b59dfa', '#f583bd', '#fb923c', '#a3a3f7', '#818cf8', '#fbbf24'
    ];
    this.banqueDistributionChartData = {
      labels: banques,
      datasets: [
        {
          data: banqueCounts,
          backgroundColor: banques.map((_, i) => doughnutColors[i % doughnutColors.length]),
          hoverBackgroundColor: banques.map((_, i) => doughnutColors[(i + 1) % doughnutColors.length])
        }
      ]
    };
    this.banqueDistributionChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      cutout: '60%',
      plugins: {
        legend: { labels: { color: textColor } }
      }
    };

    // 3. Line Chart: Evolution par Mois
    const monthMap: { [key: string]: number } = {};
    this.retraitesLightData.forEach(r => {
      const date = r.dateEcheance || r.dateCreation;
      if (date) {
        const d = new Date(date);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
          monthMap[key] = (monthMap[key] || 0) + 1;
        }
      }
    });
    const months = Object.keys(monthMap).sort();
    const traitesPerMonth = months.map(m => monthMap[m]);
    this.traitesPerMonthChartData = {
      labels: months,
      datasets: [
        {
          label: 'Traites par Mois',
          data: traitesPerMonth,
          fill: false,
          borderColor: '#fb9332',
          backgroundColor: '#fb9332',
          tension: 0.3
        }
      ]
    };
    this.traitesPerMonthChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      plugins: {
        legend: { labels: { color: textColor } }
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

  updateStatsAndCharts() {
    const totalAmount = this.getTotalAmount(this.retraitesLightData);
    const avgAmount = this.getAverageAmount(this.retraitesLightData);
    const pending = this.getPendingCount(this.retraitesLightData);
    const banks = this.getUniqueBanks(this.retraitesLightData);
    this.animateValue('animatedTotalAmount', totalAmount);
    this.animateValue('animatedAverageAmount', avgAmount);
    this.animateValue('animatedPendingCount', pending);
    this.animateValue('animatedUniqueBanks', banks);
    this.initCharts();
  }
}
