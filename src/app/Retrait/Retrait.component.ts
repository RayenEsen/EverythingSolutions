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
import { Adresse } from '../shared/adresse';
import { Fournisseur } from '../shared/Fournisseur';
import { AddRetraiteDTO } from '../DTO/AddRetrait';
import { FournisseurService } from '../Services/Fournisseurs.service';
import { BanquesService } from '../Services/Banques.service';

@Component({
  selector: 'app-Retrait',
  templateUrl: './Retrait.component.html',
  styleUrls: ['./Retrait.component.css'],
  imports: [AutoCompleteModule , FormsModule,DatePickerModule,InputNumberModule,DrawerModule, ContextMenuModule, MenubarModule  , ToastModule , CommonModule, Menubar, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, TagModule],
  providers: [MessageService],
})
export class RetraitComponent implements OnInit {
  todayDate: string | undefined;

  constructor(private ServiceB : BanquesService,private ServiceF: FournisseurService, private messageService: MessageService, private router: Router,  ) { }


  items: MenuItem[] | undefined;
  AddRetraitInfo : boolean = false;
  AddRetrait : AddRetraiteDTO  = new AddRetraiteDTO();


  items2: any[] = [
    { label: 'Voir Retraite', icon: 'pi pi-eye',  },
    { label: 'Supprimer', icon: 'pi pi-trash', },
  ];

  selectedRetrait? : Retraite;
  selectedBank: Banque | null = null;
  filteredBanks: Banque[] = [];
  



  /*Dummy Testing data*/

  retraitesLightData: RetraiteLightDto[] = [
    {
      id: 1,
      montant: 18500.750,
      numeroCheque: 'CHQ2023-1542',
      dateEcheance: new Date('2023-11-30'),
      entrepriseNom: 'SOGETRANS SARL',
      banqueNom: 'Banque Zitouna',
      banqueAdresse: 'Les Berges du Lac, Tunis',
      fournisseurNom: 'Tunisie Télécom',
      getFormattedEcheance: function (): string {
        throw new Error('Function not implemented.');
      },
      getMontantFormatted: function (): string {
        throw new Error('Function not implemented.');
      },
      fournisseurAdresse: 'Sfax',
      getFournisseurComplete: function (): string {
        throw new Error('Function not implemented.');
      }
    },
    {
      id: 2,
      montant: 32450.000,
      numeroCheque: 'CHQ2023-1789',
      dateEcheance: new Date('2023-12-15'),
      entrepriseNom: 'Amen Invest',
      banqueNom: 'Amen Bank',
      banqueAdresse: 'Rue de la Monnaie, Tunis',
      fournisseurNom: 'STEG',
      getFormattedEcheance: function (): string {
        throw new Error('Function not implemented.');
      },
      getMontantFormatted: function (): string {
        throw new Error('Function not implemented.');
      },
      fournisseurAdresse: 'Sfax',
      getFournisseurComplete: function (): string {
        throw new Error('Function not implemented.');
      }
    },
    {
      id: 3,
      montant: 12780.500,
      numeroCheque: 'CHQ2023-2015',
      dateEcheance: new Date('2024-01-20'),
      entrepriseNom: 'Poulina Group',
      banqueNom: 'BIAT',
      banqueAdresse: 'Avenue Habib Bourguiba, Tunis',
      fournisseurNom: 'SOTETEL',
      getFormattedEcheance: function (): string {
        throw new Error('Function not implemented.');
      },
      getMontantFormatted: function (): string {
        throw new Error('Function not implemented.');
      },
      fournisseurAdresse: 'Sfax',
      getFournisseurComplete: function (): string {
        throw new Error('Function not implemented.');
      }
    },
    {
      id: 4,
      montant: 8500.250,
      numeroCheque: 'CHQ2023-2256',
      dateEcheance: new Date('2024-02-10'),
      entrepriseNom: 'Ulysse Travel',
      banqueNom: 'Banque de Tunisie',
      banqueAdresse: 'Rue Hédi Nouira, Tunis',
      fournisseurNom: 'Tunisair',
      getFormattedEcheance: function (): string {
        throw new Error('Function not implemented.');
      },
      getMontantFormatted: function (): string {
        throw new Error('Function not implemented.');
      },
      fournisseurAdresse: 'Sfax',
      getFournisseurComplete: function (): string {
        throw new Error('Function not implemented.');
      }
    },
    {
      id: 5,
      montant: 42000.000,
      numeroCheque: 'CHQ2023-2498',
      dateEcheance: new Date('2024-03-05'),
      entrepriseNom: 'Magasin Général',
      banqueNom: 'Société Tunisienne de Banque',
      banqueAdresse: 'Avenue Mohamed V, Tunis',
      fournisseurNom: 'Carrefour Tunisie',
      getFormattedEcheance: function (): string {
        throw new Error('Function not implemented.');
      },
      getMontantFormatted: function (): string {
        throw new Error('Function not implemented.');
      },
      fournisseurAdresse: 'Sfax',
      getFournisseurComplete: function (): string {
        throw new Error('Function not implemented.');
      }
    }
  ];




 

  
  /* Dummy Testing data */




  loading: boolean = false;
  fournisseursData: Fournisseur[]  = [];
  banquesData: Banque[] = [];
  ngOnInit() {
        // Fetch fournisseurs data
        this.ServiceF.getAll().subscribe(
          (data) => {
            this.fournisseursData = data;
            this.messageService.add({severity: 'success', summary: 'Données chargées', detail: 'Liste des fournisseurs chargée avec succès!'});
          },
          (error) => {
            this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les fournisseurs!'});
          }
        );

        this.ServiceB.getAll().subscribe(
          (data: Banque[]) => {
            this.banquesData = data; // Assign the data to banques array
            console.log('Banques fetched successfully:', this.banquesData);
          },
          (error) => {
            console.error('Error fetching banques data:', error);
          }
        );
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0]; // 'yyyy-MM-dd'
    this.items = [
      {label: 'Ajouter', icon: 'pi pi-plus', command: () => this.toggleAddRetraitInfo()}, 
      { label: 'Importer', icon: 'pi pi-file-import'  }, 
      {
        label: 'Exporter',
        icon: 'pi pi-file-excel', 
        items: [
          { label: 'Excel', icon: 'pi pi-file-excel', },
          { label: 'PDF', icon: 'pi pi-file-pdf',  },
        ]
      },
      { label: 'Supprimer', icon: 'pi pi-file-excel' , },
      { label: 'Imprimer', icon: 'pi pi-print' ,  } ,
      { label: 'Sauvegarder', icon: 'pi pi-save' , } ,
    ];
}

  // Function to format date
  getFormattedEcheance(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
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

validateForm(montantInput: any, chequeInput: HTMLInputElement) {

  console.log(
    "Numéro de Chèque:", this.AddRetrait.numeroCheque, 
    "Date:", this.todayDate, 
    "Montant:", this.AddRetrait.montant, 
    "Fournisseur:", this.selectedFournisseur, 
    "Banque:", this.selectedBank, 
    "Adresse:", this.selectedAddress, 
    "RIB:", this.AddRetrait.rib
  );
  
  // Reset errors
  this.showMontantError = false;
  this.showChequeError = false;
  this.showDateError = false;
  this.showFournisseurError = false;
  this.showBankError = false;
  this.showAddressError = false;
  this.showRibError = false;

  // Validate amount
  if (!montantInput.value || parseFloat(montantInput.value) <= 0) {
    this.showMontantError = true;
  }

  // Validate cheque number
  if (!chequeInput.value || chequeInput.value.trim() === '') {
    this.showChequeError = true;
  }

  // Validate date
  if (!this.selectedDate) {
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

  // Validate address
  if (!this.selectedAddress || !this.selectedAddress.rue || this.selectedAddress.rue.trim() === '') {
    this.showAddressError = true;
  }

  // Validate RIB
  if (!this.AddRetrait.rib ) {
    this.showRibError = true;
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
      numeroCheque: chequeInput.value.trim(),
      dateEcheance: new Date(this.todayDate || ''),
      montant: parseFloat(montantInput.value),
      fournisseurId: this.selectedFournisseur?.id || 0,
      banqueId: this.selectedBank?.id || 0,
      banqueAdresseId: this.selectedAddress?.id || 0,
      rib: this.AddRetrait.rib
    };
    
    this.submitForm(formData);
  }
}

submitForm(data: any) {
  this.messageService.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Retraite ajoutée avec succès !'
  });
  this.AddRetraitInfo = false;
}


  items3: any[] | undefined;

  filterBanks(event: any) {
    const query = event.query.toLowerCase();
    this.filteredBanks = this.banquesData.filter(bank => 
      bank.nom.toLowerCase().includes(query) 
    );
  }
  
  selectedAddress: Adresse | null = null;
  filteredAddresses: Adresse[] = [];
  
  // Add this to your component class
  filterAddresses(event: { query: string }) {
    if (!this.selectedBank?.adresses) {
      this.filteredAddresses = [];
      return;
    }
  
    const searchTerm = event.query.toLowerCase();
    this.filteredAddresses = this.selectedBank.adresses.filter(address => {
      const fullAddress = this.formatAdresse(address).toLowerCase();
      return fullAddress.includes(searchTerm);
    });
  }
  
  formatAdresse(adresse: Adresse): string {
    return `${adresse.rue}, ${adresse.codePostal} ${adresse.ville}, ${adresse.pays}`;
  }

  selectedFournisseur: Fournisseur | null = null;
  filteredFournisseurs: Fournisseur[] = [];
  
  filterFournisseurs(event: { query: string }) {
    const q = event.query.trim().toLowerCase();
    this.filteredFournisseurs = this.fournisseursData.filter(f =>
      f.nom.toLowerCase().includes(q) ||
      f.telephone.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      f.adresse.toLowerCase().includes(q)
    );
  }
  
  
}
