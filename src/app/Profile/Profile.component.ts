import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/Auth.service';
import { MessageService } from 'primeng/api';
import { Entreprise } from '../shared/Entreprise';
import { CommonModule } from '@angular/common';
import { Console } from 'console';
import { ToastModule } from 'primeng/toast';

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

  entreprise : Entreprise = new Entreprise(); 

  constructor(
    private authService: AuthService,
    private messageService: MessageService
  ) {}


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
  

  // Validate adresseEntreprise (required, min length 5)
  if (!this.entreprise.adresseEntreprise || this.entreprise.adresseEntreprise.trim().length < 5) {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'L\'adresse de l\'entreprise est requise.' });
    return;
  }
  
  // Validate adresseComplete (required, min length 5)
  if (!this.entreprise.adresseComplete || this.entreprise.adresseComplete.trim().length < 5) {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'L\'adresse complète est requise.' });
    return;
  }



  // Prepare data (no email/password changes)
  const updateData: any = {
    nomSociete: this.entreprise.nomSociete,
    matriculeFiscale: this.entreprise.matriculeFiscale,
    telephone: this.entreprise.telephone,
    adresseEntreprise: this.entreprise.adresseEntreprise,
    adresseComplete: this.entreprise.adresseComplete,
    ribBancaire: this.entreprise.ribBancaire
  };


this.authService.updateEntreprise(this.entreprise.id, updateData).subscribe({
  next: () => {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Profil mis à jour avec succès.' });
    this.isEditing = false;

    // Update local storage and defaultEntreprise
    localStorage.setItem('entrepriseInfo', JSON.stringify({ ...this.entreprise }));
    this.defaultEntreprise = { ...this.entreprise }; // <-- update the displayed info
  },
  error: err => {
    console.error('Erreur mise à jour entreprise', err);
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La mise à jour a échoué. Veuillez réessayer.' });
  }
});


}
}
