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

@Component({
  selector: 'app-RetenueSource',
  templateUrl: './RetenueSource.component.html',
  styleUrls: ['./RetenueSource.component.css'],
  imports: [ ConfirmDialog , SplitButtonModule , DialogModule, AutoCompleteModule , FormsModule,DatePickerModule,InputNumberModule,DrawerModule, ContextMenuModule, MenubarModule  , ToastModule , CommonModule, Menubar, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, TagModule],
  providers: [ConfirmationService , MessageService],
})
export class RetenueSourceComponent implements OnInit {

  constructor(
    private retenuesService: RetenuesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private ServiceF : FournisseurService,
  ) {}


  items2: any[] = [
  { label: 'Voir Retenue', icon: 'pi pi-eye', },
  { label: 'Modifier Retenue', icon: 'pi pi-pencil', },
  { label: 'Supprimer', icon: 'pi pi-trash',  },
];
  
loading = false;

items = [
  {
    label: 'Ajouter Retenue',
    icon: 'pi pi-plus',
    command: () => this.toggleAddRetenueInfo()
  },
  {
    label: 'Supprimer',
    icon: 'pi pi-trash',
  }
];

 


  retenues : RetenueDto[] = [];

  ngOnInit(): void {
    this.fetchRetenues();
  }

  fetchRetenues(): void {
    this.loading = true;
    this.retenuesService.getRetenues().subscribe({
      next: (data) => {
        this.retenues = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les retenues.' });
        this.loading = false;
      }
    });

      // Fetch fournisseurs data
  this.ServiceF.getAll().subscribe(
    (data) => {
      this.fournisseursData = data;
    },
    (error) => {
      // handle error if needed
    }
  );
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
  nom: false,
  email: false,
  telephone: false,
  adresse: false
};
FournisseurAjouter : Fournisseur = new Fournisseur();

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
  const entrepriseId = +(localStorage.getItem('employeeId') ?? 0);
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



}