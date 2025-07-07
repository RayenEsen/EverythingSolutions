import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/Auth.service';
import { MessageService } from 'primeng/api';
import { Entreprise } from '../shared/Entreprise';
import { CommonModule } from '@angular/common';
import { Console } from 'console';
import { ToastModule } from 'primeng/toast';
import { ThemeService } from '../Services/theme.service';
import { UpdateEntrepriseRequest } from '../DTO/UpdateEntrepriseRequest';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [FormsModule , CommonModule , ToastModule],
  providers: [MessageService]
})
export class ProfileComponent implements OnInit {
  isEditing = false;
  isDarkMode = false;
  logoOverlay = false;

  entreprise : Entreprise = new Entreprise(); 

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private themeService: ThemeService
  ) {
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }


  gouvernorats: string[] = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan',
  'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Sousse',
  'Monastir', 'Mahdia', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
  'Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili',
  'Sfax'
];

  defaultEntreprise: Entreprise = new Entreprise();
  ngOnInit(): void {
    try {
      const storedEntreprise = JSON.parse(localStorage.getItem('entrepriseInfo') || '{}');
      this.entreprise.id = storedEntreprise?.id ?? 0;

      if (this.entreprise.id) {
        this.authService.getEntrepriseById(this.entreprise.id).subscribe({
          next: data => {
            this.defaultEntreprise = JSON.parse(JSON.stringify(data)); // deep copy
            this.entreprise = data;       // separate copy
          },
          error: err => {
            console.error('Erreur chargement entreprise', err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement' });
          }
        });
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'ID entreprise introuvable' });
      }
    } catch (e) {
      console.error('Erreur parsing localStorage', e);
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Stockage local corrompu' });
    }
  }
  
modifiedEntreprise: any = {};

enableEdit() {
  this.isEditing = true;
  // Deep copy to avoid mutating original data before saving
  this.modifiedEntreprise = JSON.parse(JSON.stringify(this.entreprise));
}

selectedLogoFile?: File;
logoPreviewUrl?: string;

// Reference to the file input
@ViewChild('logoInput') logoInputRef!: ElementRef<HTMLInputElement>;

triggerLogoUpload() {
  if (this.logoInputRef) {
    this.logoInputRef.nativeElement.click();
  }
}

onLogoSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedLogoFile = file;
    this.logoPreviewUrl = URL.createObjectURL(file);
  }
}

save(): void {
  
  // Validate nomSociete (required, min length 3)
  if (!this.entreprise.nomSociete || this.entreprise.nomSociete.trim().length < 3) {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Le nom de la société doit contenir au moins 3 caractères.' });
    return;
  }

  

  // Validate matriculeFiscale (required, format example: 7 digits + 3 uppercase letters)
  const matriculeFiscalePattern = /^[0-9]{7}[A-Z]{3}$/;
  if (!this.entreprise.matriculeFiscale || !matriculeFiscalePattern.test(this.entreprise.matriculeFiscale)) {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Le matricule fiscal est invalide. Format attendu : 7 chiffres suivis de 3 lettres majuscules (ex: 1234567ABC).' });
    return;
  }

  

  // Validate telephone (required, digits only, length 8-15)
  const telephonePattern = /^[0-9]{8,15}$/;
  if (!this.entreprise.telephone || !telephonePattern.test(this.entreprise.telephone)) {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Le numéro de téléphone est invalide. Il doit contenir entre 8 et 15 chiffres.' });
    return;
  }
  


  
  // Validate adresseComplete (required, min length 5)
  if (!this.entreprise.adresseComplete || this.entreprise.adresseComplete.trim().length < 5) {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'L\'adresse complète est requise.' });
    return;
  }



  // Build FormData for PascalCase keys (matching backend DTO)
  const formData = new FormData();
  formData.append('NomSociete', this.entreprise.nomSociete || '');
  formData.append('MatriculeFiscale', this.entreprise.matriculeFiscale || '');
  formData.append('AdresseEntreprise', this.entreprise.adresseEntreprise || '');
  formData.append('AdresseComplete', this.entreprise.adresseComplete || '');
  formData.append('Telephone', this.entreprise.telephone || '');
  formData.append('SiteWeb', this.entreprise.siteWeb || '');
  if (this.selectedLogoFile) {
    formData.append('Logo', this.selectedLogoFile);
  }

  // Debug: log all FormData keys/values
  for (const pair of formData.entries()) {
    console.log(pair[0]+ ': ' + pair[1]);
  }

  this.authService.updateEntreprise(Number(this.entreprise.id || 0), formData).subscribe({
    next: () => {
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Profil mis à jour avec succès.' });
      this.isEditing = false;
      this.selectedLogoFile = undefined;
      this.logoPreviewUrl = undefined;
      localStorage.setItem('entrepriseInfo', JSON.stringify({ ...this.entreprise }));
      this.defaultEntreprise = { ...this.entreprise };
    },
    error: err => {
      console.error('Erreur mise à jour entreprise', err);
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La mise à jour a échoué. Veuillez réessayer.' });
    }
  });
}

isFormChanged(): boolean {
  // Compare entreprise with defaultEntreprise and check if logo changed
  return JSON.stringify({
    ...this.entreprise,
    imageUrl: undefined // ignore imageUrl for comparison
  }) !== JSON.stringify({
    ...this.defaultEntreprise,
    imageUrl: undefined
  }) || !!this.selectedLogoFile;
}

cancelEdit(): void {
  // Revert all changes
  this.entreprise = JSON.parse(JSON.stringify(this.defaultEntreprise));
  this.selectedLogoFile = undefined;
  this.logoPreviewUrl = undefined;
}
}
