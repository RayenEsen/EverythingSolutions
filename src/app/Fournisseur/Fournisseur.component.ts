import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ThemeService } from '../Services/theme.service';
import { DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

// Import the actual Fournisseur class from shared
import { Fournisseur } from '../shared/Fournisseur';
import { FournisseurService } from '../Services/Fournisseurs.service';

@Component({
  selector: 'app-fournisseur',
  templateUrl: './Fournisseur.component.html',
  styleUrls: ['./Fournisseur.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    DrawerModule,
    MenubarModule
  ],
  providers: [MessageService, ConfirmationService, FournisseurService]
})
export class FournisseurComponent implements OnInit {
  fournisseurs: (Fournisseur & { dateCreation: Date })[] = [];
  originalFournisseurs: (Fournisseur & { dateCreation: Date })[] = [];
  selectedFournisseurs: (Fournisseur & { dateCreation: Date })[] = [];
  displayDialog: boolean = false;
  fournisseur: Fournisseur & { dateCreation: Date } = {} as Fournisseur & { dateCreation: Date };
  isNew: boolean = false;
  searchText: string = '';
  loading: boolean = true;
  fournisseursThisMonth: number = 0;
  fournisseursThisYear: number = 0;
  items: MenuItem[] = [];
  stored: any;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public themeService: ThemeService,
    private fournisseurService: FournisseurService
  ) {}

  ngOnInit() {
    this.loadFournisseurs();
    this.stored = JSON.parse(localStorage.getItem('entrepriseInfo') || '{}');
    this.items = [
      {
        label: 'Nouveau Fournisseur',
        icon: 'pi pi-plus',
        command: () => {
          this.openNew();
        }
      }
    ];
  }

  loadFournisseurs() {
    this.loading = true;
    this.fournisseurService.getAll().subscribe({
      next: (data: Fournisseur[]) => {
        this.originalFournisseurs = data.map(f => ({
          ...f,
          dateCreation: (f as any).dateCreation ? new Date((f as any).dateCreation) : new Date()
        }));
        this.fournisseurs = [...this.originalFournisseurs];
        this.calculateStatistics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading fournisseurs:', error);
        this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Échec du chargement des fournisseurs'});
        this.loading = false;
      }
    });
  }

  calculateStatistics() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    this.fournisseursThisMonth = this.originalFournisseurs.filter(f =>
      f.dateCreation.getMonth() === currentMonth &&
      f.dateCreation.getFullYear() === currentYear
    ).length;

    this.fournisseursThisYear = this.originalFournisseurs.filter(f =>
      f.dateCreation.getFullYear() === currentYear
    ).length;
  }

  openNew() {
    this.isNew = true;
    this.fournisseur = {
      id: 0,
      nom: '',
      email: '',
      telephone: '',
      adresse: '',
      matriculeFournisseur: '',
      entrepriseId: 0,
      dateCreation: new Date()
    } as Fournisseur & { dateCreation: Date };
    this.displayDialog = true;
  }

  editFournisseur(fournisseur: Fournisseur & { dateCreation: Date }) {
    this.isNew = false;
    this.fournisseur = { ...fournisseur };
    if (typeof this.fournisseur.dateCreation === 'string') {
      this.fournisseur.dateCreation = new Date(this.fournisseur.dateCreation);
    }
    this.displayDialog = true;
  }

  deleteFournisseur(fournisseur: Fournisseur & { dateCreation: Date }) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le fournisseur ${fournisseur.nom} ?`,
      header: 'Confirmer la suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.fournisseurService.delete(fournisseur.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Fournisseur supprimé avec succès !',
              life: 3000
            });
            this.loadFournisseurs();
          },
          error: (error) => {
            console.error('Error deleting supplier:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec de la suppression du fournisseur.',
              life: 3000
            });
          }
        });
      }
    });
  }

  saveFournisseur() {
    this.loading = true;
    const entrepriseId = this.stored.id;
    this.fournisseur.entrepriseId = entrepriseId;

    if (this.isNew) {
      this.fournisseurService.create(this.fournisseur).subscribe({
        next: (newFournisseur) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Fournisseur créé avec succès !',
            life: 3000
          });
          this.displayDialog = false;
          this.loadFournisseurs();
        },
        error: (error) => {
          console.error('Error creating supplier:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la création du fournisseur.',
            life: 3000
          });
        }
      });
    } else {
      this.fournisseurService.update(this.fournisseur.id, this.fournisseur).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Fournisseur mis à jour avec succès !',
            life: 3000
          });
          this.displayDialog = false;
          this.loadFournisseurs();
        },
        error: (error) => {
          console.error('Error updating supplier:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la mise à jour du fournisseur.',
            life: 3000
          });
        }
      });
    }
    this.loading = false;
  }

  filterFournisseurs() {
    const text = this.searchText?.toLowerCase() || '';
    this.fournisseurs = this.originalFournisseurs.filter(f =>
      (f.nom?.toLowerCase().includes(text)) ||
      (f.email?.toLowerCase().includes(text)) ||
      (f.telephone?.toLowerCase().includes(text)) ||
      (f.adresse?.toLowerCase().includes(text)) ||
      (f.matriculeFournisseur?.toLowerCase().includes(text))
    );
  }
} 