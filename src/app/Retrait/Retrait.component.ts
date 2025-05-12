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
import { Adresse } from '../shared/Adresse';
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

@Component({
  selector: 'app-Retrait',
  templateUrl: './Retrait.component.html',
  styleUrls: ['./Retrait.component.css'],
  imports: [ ConfirmDialog , SplitButtonModule , DialogModule, AutoCompleteModule , FormsModule,DatePickerModule,InputNumberModule,DrawerModule, ContextMenuModule, MenubarModule  , ToastModule , CommonModule, Menubar, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, TagModule],
  providers: [ConfirmationService , MessageService],
})
export class RetraitComponent implements OnInit {
  todayDate: string | undefined;

  constructor(private confirmationService: ConfirmationService ,private ServiceA : AuthService,private ServiceR : RetraitesService,private ServiceB : BanquesService,private ServiceF: FournisseurService, private messageService: MessageService, private router: Router,  ) { }


  items: MenuItem[] | undefined;
  AddRetraitInfo : boolean = false;
  AddRetrait : AddRetraiteDTO  = new AddRetraiteDTO();


  items2: any[] = [
    { label: 'Voir Retraite', icon: 'pi pi-eye',  command: () => this.NavigateToRetraiteDetails(this.selectedRetrait!)},
    { label: 'Supprimer', icon: 'pi pi-trash',  command: () => this.DeleteRetrait()},
  ];

  items4: any[] = [];

  selectedRetrait? : Retraite;
  selectedBank: Banque | null = null;
  filteredBanks: Banque[] = [];
  



  /*Dummy Testing data*/

  retraitesLightData: RetraiteLightDto[] = [
    
  ];




 

  
  /* Dummy Testing data */


  loadTraites()
  {
    this.ServiceR.getRetraites().subscribe({
      next: (retraites) => {
        console.log('Retraites:', retraites);
        // Do something with retraites, like storing them in a local variable
        this.retraitesLightData = retraites;
      },
      error: (err) => {
        console.error('Error fetching retraites:', err);
        // Optionally show an error message to the user
      }
    });
  }

  loading: boolean = false;
  fournisseursData: Fournisseur[]  = [];
  banquesData: Banque[] = [];
  ngOnInit() {

    this.loadTraites();
        // Fetch fournisseurs data
        this.ServiceF.getAll().subscribe(
          (data) => {
            this.fournisseursData = data;
          },
          (error) => {
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
      {
        label: 'Manager Traite',
        icon: 'pi pi-folder',
        items: [
          {
            label: 'Ajouter',
            icon: 'pi pi-plus',
            command: () => this.toggleAddRetraitInfo()
          },
          {
            label: 'Supprimer',
            icon: 'pi pi-trash'
          }
        ]
      },
      {
        label: 'Manager Fournisseur',
        icon: 'pi pi-users',
        items: [
          { label: 'Ajouter', icon: 'pi pi-user-plus', command: () => this.toggleAddFournisseurInfo() },
          { label: 'Voir', icon: 'pi pi-eye', command: () => this.toggleDialog() }
        ]
      },
      {
        label: 'Manager Banque',
        icon: 'pi pi-building',
        items: [
          { label: 'Ajouter', icon: 'pi pi-plus-circle', command: () => this.toggleAddBanqueInfo() },
          { label: 'Voir', icon: 'pi pi-eye', command: () => this.toggleDialogBanque() }
        ]
      }
    ];
    

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

  console.log(
    "Numéro de Chèque:", this.AddRetrait.NumCheque, 
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
  if (this.AddRetrait.montant === undefined || this.AddRetrait.montant <= 0) {
    this.showMontantError = true;
  }

  // Validate cheque number
  if (!this.AddRetrait.NumCheque || this.AddRetrait.NumCheque.trim() === '') {
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
      NumCheque: this.AddRetrait.NumCheque.trim(),
      dateEcheance: new Date(this.todayDate || ''),
      montant: parseFloat(this.AddRetrait.montant.toString()),
      fournisseurId: this.selectedFournisseur?.id || 0,
      banqueId: this.selectedBank?.id || 0,
      adresseId: this.selectedAddress?.id || 0,
      rib: String(this.AddRetrait.rib),
      entrepriseId: this.ServiceA.getDecodedToken()?.id || 0, // Get the entrepriseId from the token
    };
    
    
    this.submitForm(formData);
  }
}

submitForm(data: any) {

   // Call the service to create the Retraite
   this.ServiceR.createRetraite(data).subscribe(
    (response) => {
      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Retraite ajoutée avec succès !'
      });

      // Reset or close the form
      this.AddRetraitInfo = false;
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
  

  DeleteRetrait() {
    if (this.selectedRetrait?.id !== undefined) {
      this.ServiceR.deleteRetraite(this.selectedRetrait.id).subscribe({
      next: () => {
        console.log('Retraite deleted successfully.');
      },
      error: err => {
        console.error('Error deleting retraite:', err);
    }
  }
      );
    }
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

addAdresse() {

  this.banque.adresses.push({
    rue: '',
    codePostal: '',
    ville: '',
    pays: '',
    estSiegeSocial: false,
    id: 0,
    formattedAddress: ''
  });
}

removeAdresse(index: number) {
  this.banque.adresses?.splice(index, 1);
}


AddBanque() {
  console.log(this.banque);
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
        id: 0, // Add the missing 'id' property
        nom: '',
        adresses: [
          {
            rue: '',
            codePostal: '',
            ville: '',
            pays: '',
            estSiegeSocial: false,
            id: 0,
            formattedAddress: ''
          }
        ]
      };

      // Fermer le drawer
      this.AddBanqueInfo = false;
    },
    (error) => {
      console.error('Error adding banque:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de l\'ajout de la banque.'
      });
    }
  );
}


showNomBanqueError = false;
showAdresseErrorList: boolean[] = [];
showNoAdresseError = false; // Nouveau flag

validateBanqueForm(): boolean {
  this.showNomBanqueError = !this.banque.nom?.trim();
  this.showAdresseErrorList = [];
  this.showNoAdresseError = this.banque.adresses.length === 0;

  let allAdressesValid = true;

  this.banque.adresses.forEach((adresse, index) => {
    const isInvalid = !adresse.rue?.trim() || !adresse.codePostal?.trim() || !adresse.ville?.trim() || !adresse.pays?.trim();
    this.showAdresseErrorList[index] = isInvalid;
    if (isInvalid) allAdressesValid = false;
  });

  return !this.showNomBanqueError && !this.showNoAdresseError && allAdressesValid;
}

onSaveBanque() {
  if (this.validateBanqueForm()) {
    this.AddBanque();
  }
}


showFournisseurErrors = {
  nom: false,
  email: false,
  telephone: false,
  adresse: false
};
validateFournisseurForm(): boolean {
  const f = this.FournisseurAjouter;

  this.showFournisseurErrors.nom = !f.nom?.trim();
  this.showFournisseurErrors.email = !f.email?.trim();
  this.showFournisseurErrors.telephone = !f.telephone?.trim();
  this.showFournisseurErrors.adresse = !f.adresse?.trim();

  return !(this.showFournisseurErrors.nom || this.showFournisseurErrors.email || this.showFournisseurErrors.telephone || this.showFournisseurErrors.adresse);
}
onSaveFournisseur() {
  if (this.validateFournisseurForm()) {
    this.AddFournisseur();
  }
}
AddFournisseur() {
  
  this.ServiceF.create(this.FournisseurAjouter).subscribe(
    (response) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Fournisseur ajouté avec succès !'
      });

      this.fournisseursData.push(response); // Ajouter le nouveau à la liste
      this.FournisseurAjouter = {
        id: 0,
        nom: '',
        email: '',
        telephone: '',
        adresse: ''
      }; // Réinitialiser le formulaire
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

selectedFournisseurToDelete: Fournisseur | null = null;
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
      this.ServiceF.delete(fournisseur.id).subscribe({
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
// La méthode onDeleteFournisseur n'est plus nécessaire car nous gérons tout dans confirmDeleteFournisseur


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

}
