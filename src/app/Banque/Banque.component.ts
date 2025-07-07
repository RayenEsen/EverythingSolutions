import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Menubar, MenubarModule } from 'primeng/menubar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ThemeService } from '../Services/theme.service';
import { BanquesService } from '../Services/Banques.service';
import { Banque } from '../shared/Banque';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-Banque',
  templateUrl: './Banque.component.html',
  styleUrls: ['./Banque.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MenubarModule,
    ToastModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    ContextMenuModule,
    DrawerModule,
    InputNumberModule,
    DialogModule,
    SplitButtonModule,
    ConfirmDialog,
    DropdownModule
  ],
  providers: [ConfirmationService, MessageService],
})
export class BanqueComponent implements OnInit {

  constructor(
    private confirmationService: ConfirmationService,
    private banqueService: BanquesService,
    private messageService: MessageService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  AddBanqueInfo: boolean = false;
  AddBanque: Banque = new Banque();
  ModifyBanqueInfo: boolean = false;
  
  items: MenuItem[] = [
    {
      label: 'Ajouter Banque',
      icon: 'pi pi-plus',
      command: () => this.toggleAddBanqueInfo()
    },
    {
      label: 'Supprimer',
      icon: 'pi pi-trash',
      command: () => this.deleteSelectedBanques()
    }
  ];

  items2: MenuItem[] = [
    { label: 'Modifier Banque', icon: 'pi pi-pencil', command: () => this.editBanque(this.selectedBanque) },
    { label: 'Supprimer', icon: 'pi pi-trash', command: () => this.deleteBanque(this.selectedBanque) },
  ];
  
  selectedBanque: Banque = new Banque();
  banquesData: Banque[] = [];
  SelectedBanques: Banque[] = [];
  loading: boolean = false;
  
  showNomError = false;
  showAdresseError = false;
  showRibError = false;

  banquesDataOriginal: any[] = []; 
  searchText: string = '';

  bankNames: string[] = [
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

  ngOnInit() {
    const isDarkMode = this.themeService.isDarkMode();
    if (isDarkMode) {
      document.body.classList.add('dark');
    }
    this.loadBanques();
  }

  toggleAddBanqueInfo() {
    this.AddBanqueInfo = !this.AddBanqueInfo;
    this.AddBanque = new Banque();
    this.showNomError = false;
    this.showAdresseError = false;
    this.showRibError = false;
  }
  
  validateForm() {
    this.showNomError = !this.AddBanque.nom || this.AddBanque.nom.trim() === '';
    this.showAdresseError = !this.AddBanque.adresse || this.AddBanque.adresse.trim() === '';
    this.showRibError = !this.AddBanque.rib || this.AddBanque.rib.trim().length !== 20;

    if (!this.showNomError && !this.showAdresseError && !this.showRibError) {
      this.submitForm();
    }
  }

  submitForm() {
    const stored = JSON.parse(localStorage.getItem('entrepriseInfo') || '{}');
    this.AddBanque.entrepriseId = stored?.id;

    this.banqueService.create(this.AddBanque).subscribe(
      (response) => {
        this.banquesData.push(response);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Banque ajoutée avec succès !'
        });
        this.AddBanqueInfo = false;
        // Update stats
        const totalBanques = this.getTotalBanques(this.banquesData);
        const banksThisMonth = this.getBanksThisMonthCount(this.banquesData);
        this.mostFrequentBank = this.getMostFrequentBank(this.banquesData);
        this.animateValue('animatedTotalBanques', totalBanques);
        this.animateValue('animatedBanksThisMonth', banksThisMonth);
      },
    );
  }

  editBanque(banque: Banque) {
    this.selectedBanque = { ...banque };
    this.ModifyBanqueInfo = true;
  }

  deleteBanque(banque: Banque) {
    if (banque?.id == null) return;

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer la banque ${banque.nom} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.banqueService.delete(banque.id).subscribe({
          next: () => {
            this.banquesData = this.banquesData.filter(r => r.id !== banque.id);
            this.banquesDataOriginal = this.banquesDataOriginal.filter(r => r.id !== banque.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Banque supprimée avec succès'
            });
            // Update stats
            const totalBanques = this.getTotalBanques(this.banquesData);
            const banksThisMonth = this.getBanksThisMonthCount(this.banquesData);
            this.mostFrequentBank = this.getMostFrequentBank(this.banquesData);
            this.animateValue('animatedTotalBanques', totalBanques);
            this.animateValue('animatedBanksThisMonth', banksThisMonth);
          },
        });
      }
    });
  }

  deleteSelectedBanques(): void {
    if (this.SelectedBanques.length === 0) return;

    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer ${this.SelectedBanques.length} banque(s) ?`,
      header: 'Confirmation de suppression',
      accept: () => {
        const idsToDelete = this.SelectedBanques.map(b => b.id);
        idsToDelete.forEach(id => {
          this.banqueService.delete(id).subscribe({
            next: () => {
              this.banquesData = this.banquesData.filter(r => r.id !== id);
              this.banquesDataOriginal = this.banquesDataOriginal.filter(r => r.id !== id);
              this.SelectedBanques = this.SelectedBanques.filter(r => r.id !== id);
              if (this.SelectedBanques.length === 0) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Suppression réussie',
                  detail: 'Les banques sélectionnées ont été supprimées.'
                });
                // Update stats
                const totalBanques = this.getTotalBanques(this.banquesData);
                const banksThisMonth = this.getBanksThisMonthCount(this.banquesData);
                this.mostFrequentBank = this.getMostFrequentBank(this.banquesData);
                this.animateValue('animatedTotalBanques', totalBanques);
                this.animateValue('animatedBanksThisMonth', banksThisMonth);
              }
            }
          });
        });
      }
    });
  }

  filterBanques() {
    const text = this.searchText?.toLowerCase() || '';
    this.banquesData = this.banquesDataOriginal.filter(r =>
      Object.values(r).some(value =>
        String(value).toLowerCase().includes(text)
      )
    );
  }

  ModifyBanque(): void {
    if (!this.selectedBanque || !this.selectedBanque.id) return;

    this.banqueService.update(this.selectedBanque.id, this.selectedBanque).subscribe({
      next: () => {
        this.banquesData = this.banquesData.map(b => b.id === this.selectedBanque.id ? { ...b, ...this.selectedBanque } : b);
        this.banquesDataOriginal = this.banquesDataOriginal.map(b => b.id === this.selectedBanque.id ? { ...b, ...this.selectedBanque } : b);
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Banque modifiée avec succès', life: 3000 });
        this.ModifyBanqueInfo = false;
        // Update stats
        const totalBanques = this.getTotalBanques(this.banquesData);
        const banksThisMonth = this.getBanksThisMonthCount(this.banquesData);
        this.mostFrequentBank = this.getMostFrequentBank(this.banquesData);
        this.animateValue('animatedTotalBanques', totalBanques);
        this.animateValue('animatedBanksThisMonth', banksThisMonth);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la modification', life: 3000 });
      }
    });
  }

  // Stats section
  animatedTotalBanques: number = 0;
  animatedBanksThisMonth: number = 0;
  mostFrequentBank: string = 'N/A';

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
      (this[property] as unknown as number) = parseFloat(current.toFixed(0));
    }, stepTime);
  }

  getTotalBanques(banques: any[]): number {
    return banques.length;
  }

  getBanksThisMonthCount(banques: any[]): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return banques.filter(b => {
      if (!b.dateCreation) return false;
      const creationDate = new Date(b.dateCreation);
      return creationDate.getMonth() === currentMonth && 
             creationDate.getFullYear() === currentYear;
    }).length;
  }
  
  getMostFrequentBank(banques: any[]): string {
    if (banques.length === 0) return 'N/A';

    const frequencyMap = banques.reduce((acc, b) => {
      acc[b.nom] = (acc[b.nom] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.keys(frequencyMap).reduce((a, b) => frequencyMap[a] > frequencyMap[b] ? a : b);
  }

  loadBanques() {
    this.loading = true;
    this.banqueService.getAll().subscribe({
      next: (banques) => {
        this.banquesDataOriginal = banques;
        this.banquesData = banques;
        
        const totalBanques = this.getTotalBanques(this.banquesData);
        const banksThisMonth = this.getBanksThisMonthCount(this.banquesData);
        this.mostFrequentBank = this.getMostFrequentBank(this.banquesData);

        this.animateValue('animatedTotalBanques', totalBanques);
        this.animateValue('animatedBanksThisMonth', banksThisMonth);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching banques:', err);
        this.loading = false;
      }
    });
  }
}
