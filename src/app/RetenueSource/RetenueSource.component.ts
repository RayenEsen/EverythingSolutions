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
    private router: Router,
    public themeService: ThemeService,
  ) {}


items2: any[] = [
  { label: 'Voir Retenue', icon: 'pi pi-eye' , command: () => this.viewRetenue(this.contextMenuSelection) },
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
  this.showNumeroFactureError = false;
  this.showMontantTTCError = false;
  this.showTypeError = false;
  this.showFournisseurError = false;

  let isValid = true;
  const numeroFactureRegex = /^[0-9]{7}[A-Z]{3}$/;

  // Validation checks
  if (!this.AddRetenue.numeroFacture || !numeroFactureRegex.test(this.AddRetenue.numeroFacture.trim())) {
    this.showNumeroFactureError = true;
    isValid = false;
  }

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

        this.retenues.push(response);
        this.AddRetenueInfo = false;

        // ✅ Recalculate totals and average
      const totalTTC = this.getTotalTTC(this.retenues);
      const averageNet = this.getAverageNet(this.retenues);
      const retenueTotal = this.getRetenueTotal(this.retenues);
      const RetenueAvg = this.getAverageRetenueMontant(this.retenues);

      this.animateValue('animatedTotalTTC', totalTTC);
      this.animateValue('animatedAverageNet', averageNet);
      this.animateValue('animatedRetenueTotal', retenueTotal);
      this.animateValue('animatedretenueAvg', RetenueAvg);
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

  this.retenuesService.deleteRetenues(idsToDelete).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Suppression réussie',
        detail: 'Les retenues sélectionnées ont été supprimées.'
      });

      this.retenues = this.retenues.filter(r => !idsToDelete.includes(r.id));
      this.SelectedRetenues = [];

      const totalTTC = this.getTotalTTC(this.retenues);
      const averageNet = this.getAverageNet(this.retenues);
      const retenueTotal = this.getRetenueTotal(this.retenues);
      const RetenueAvg = this.getAverageRetenueMontant(this.retenues);

      this.animateValue('animatedTotalTTC', totalTTC);
      this.animateValue('animatedAverageNet', averageNet);
      this.animateValue('animatedRetenueTotal', retenueTotal);
      this.animateValue('animatedretenueAvg', RetenueAvg);
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


onDelete(id: number): void {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
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
}

















}