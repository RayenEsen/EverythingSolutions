import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { Entreprise } from '../shared/Entreprise';
import { AuthService } from '../shared/Auth.service';
import { LoginRequest } from '../DTO/LoginRequest';
import { RegisterRequest } from '../DTO/RegisterRequest';
import { CaptchaService } from '../Services/Captcha.service';
import { RecaptchaV3Module } from 'ng-recaptcha';
import { RecaptchaModule } from 'ng-recaptcha';
import { DialogModule } from 'primeng/dialog';
import { PopoverModule } from 'primeng/popover';
import { AutoComplete } from 'primeng/autocomplete';

interface AutoCompleteCompleteEvent {
    originalEvent: Event;
    query: string;
}

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './Login.component.html',
  styleUrls: ['./Login.component.css'],
  imports: [AutoComplete, PopoverModule ,CommonModule, ButtonModule, InputTextModule, FormsModule, ToastModule , AutoCompleteModule , RecaptchaV3Module , RecaptchaModule , DialogModule],
  providers: [MessageService]
})
export class LoginComponent implements OnInit, OnDestroy {
  private previousDarkMode: boolean = false;

  constructor(public ServiceA: AuthService, private messageService: MessageService , private router: Router , private captchaService: CaptchaService ) {}

  isButtonDisabled: boolean = false;

  ngOnInit(): void {
    // Store previous dark mode state
    this.previousDarkMode = document.documentElement.classList.contains('dark-mode');
    
    // Remove dark mode classes
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark');

    const lastClickTime = localStorage.getItem('resetButtonTimestamp');
    if (lastClickTime) {
      const diff = Date.now() - parseInt(lastClickTime, 10);
      if (diff < 30 * 60 * 1000) { // 30 minutes
        this.isButtonDisabled = true;
        const remainingTime = 30 * 60 * 1000 - diff;
        setTimeout(() => this.isButtonDisabled = false, remainingTime);
      }
    }
  }

  ngOnDestroy(): void {
    // Restore previous dark mode state when leaving the login page
    if (this.previousDarkMode) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark');
    }
  }

adresseOptions = [
  { label: 'Ariana', value: 'Ariana' },
  { label: 'Béja', value: 'Béja' },
  { label: 'Ben Arous', value: 'Ben Arous' },
  { label: 'Bizerte', value: 'Bizerte' },
  { label: 'Gabès', value: 'Gabès' },
  { label: 'Gafsa', value: 'Gafsa' },
  { label: 'Jendouba', value: 'Jendouba' },
  { label: 'Kairouan', value: 'Kairouan' },
  { label: 'Kasserine', value: 'Kasserine' },
  { label: 'Kébili', value: 'Kébili' },
  { label: 'Le Kef', value: 'Le Kef' },
  { label: 'Mahdia', value: 'Mahdia' },
  { label: 'La Manouba', value: 'La Manouba' },
  { label: 'Médenine', value: 'Médenine' },
  { label: 'Monastir', value: 'Monastir' },
  { label: 'Nabeul', value: 'Nabeul' },
  { label: 'Sfax', value: 'Sfax' },
  { label: 'Sidi Bouzid', value: 'Sidi Bouzid' },
  { label: 'Siliana', value: 'Siliana' },
  { label: 'Sousse', value: 'Sousse' },
  { label: 'Tataouine', value: 'Tataouine' },
  { label: 'Tozeur', value: 'Tozeur' },
  { label: 'Tunis', value: 'Tunis' },
  { label: 'Zaghouan', value: 'Zaghouan' }
];



  entreprise = new Entreprise();
  registerDto: RegisterRequest = new RegisterRequest();
  matriculeFiscalePattern = /^[0-9]{6}[A-Z]{2}$/;

  confirmPassword = '';
  companyVisible = false;
  AccountVisible = false;
  loginRequest = new LoginRequest();

  emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
  // Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character
  // and be at least 8 characters long
  // Example: "Password1!"

  showCompanyForm() {
    this.companyVisible = true;
    this.AccountVisible = false;
  }
  
  showAccountForm() {
    this.companyVisible = false;
    this.AccountVisible = true;
  }
  

  Login() {
    if (!this.loginRequest.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Email manquant',
        detail: 'Veuillez saisir votre adresse e-mail.',
        life: 3000
      });
      return;
    }

    

    if (!this.emailPattern.test(this.loginRequest.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Email invalide',
        detail: 'Veuillez saisir une adresse e-mail valide.',
        life: 3000
      });
      return;
    }

    if (!this.loginRequest.password) {
      this.messageService.add({
        severity: 'error',
        summary: 'Mot de passe manquant',
        detail: 'Veuillez saisir votre mot de passe.',
        life: 3000
      });
      return;
    }




    this.ServiceA.login(this.loginRequest).subscribe(
      (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Connexion réussie',
          detail: 'Vous êtes connecté avec succès !',
          life: 3000
        });
        console.log("Local Storage contents:", localStorage);
        this.router.navigate(['']);
      },
     (error) => {
  console.error("Échec de la connexion", error);

  // Vérifie si un message d'erreur spécifique est renvoyé par le backend
  const errorMessage = error?.error?.message;

  if (errorMessage === 'Cet email est déjà utilisé.') {
    this.messageService.add({
      severity: 'error',
      summary: 'Email utilisé',
      detail: 'Cet email est déjà utilisé.',
      life: 3000
    });
  } else {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Échec de la connexion, veuillez réessayer.',
      life: 3000
    });
  }
}

    );
  }

  

// Variables at the top
adresseComplete: string = '';
codePostal: string = '';

// Updated Register() method
Register() {
  if (!this.acceptTerms) {
    this.messageService.add({ severity: 'error', summary: 'Conditions non acceptées', detail: 'Veuillez accepter les CGU.', life: 3000 });
    return;
  }

  if (!this.captchaToken) {
    this.messageService.add({ severity: 'error', summary: 'CAPTCHA requis', detail: 'Veuillez compléter le CAPTCHA.', life: 3000 });
    return;
  }

  if (!this.registerDto.adresseEntreprise || !this.registerDto.adresseEntreprise.trim()) {
    this.messageService.add({ severity: 'error', summary: 'Gouvernorat manquant', detail: 'Veuillez choisir un gouvernorat.', life: 3000 });
    return;
  }

  // Trim fields
  const trimmedAdresseComplete = this.adresseComplete.trim();
  const trimmedCodePostal = this.codePostal.trim();

  // Validate adresseComplete (minimum 5 characters)
  if (trimmedAdresseComplete.length < 5) {
    this.messageService.add({
      severity: 'error',
      summary: 'Adresse invalide',
      detail: 'L\'adresse complète doit contenir au moins 5 caractères.',
      life: 3000
    });
    return;
  }

  // Validate codePostal (4 digits)
  if (!/^[0-9]{4}$/.test(trimmedCodePostal)) {
    this.messageService.add({
      severity: 'error',
      summary: 'Code postal invalide',
      detail: 'Le code postal doit être composé de 4 chiffres.',
      life: 3000
    });
    return;
  }

  // Validate adresseEntreprise against options
  const isAdresseValid = this.adresseOptions.some(opt => opt.value === this.registerDto.adresseEntreprise);
  if (!isAdresseValid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Adresse invalide',
      detail: 'L\'adresse choisie n\'est pas reconnue.',
      life: 3000
    });
    return;
  }

  if (!this.emailPattern.test(this.registerDto.email)) {
    this.messageService.add({ severity: 'error', summary: 'Email invalide', detail: 'Adresse e-mail non valide.', life: 3000 });
    return;
  }

  if (!this.passwordPattern.test(this.registerDto.password)) {
    this.messageService.add({
      severity: 'error',
      summary: 'Mot de passe faible',
      detail: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
      life: 3000
    });
    return;
  }

  if (this.registerDto.password !== this.confirmPassword) {
    this.messageService.add({ severity: 'error', summary: 'Mots de passe différents', detail: 'Les mots de passe ne correspondent pas.', life: 3000 });
    return;
  }

  const matriculeFiscalePattern = /^[0-9]{7}[A-Z]{3}$/;
  if (!matriculeFiscalePattern.test(this.registerDto.matriculeFiscale)) {
    this.messageService.add({
      severity: 'error',
      summary: 'Matricule invalide',
      detail: 'Le matricule fiscal doit être au format 1234567ABC.',
      life: 3000
    });
    return;
  }

  // Concatenate adresseComplete with codePostal for adresseEntreprise
  this.registerDto.adresseComplete = `${trimmedAdresseComplete}, ${trimmedCodePostal}`;
  this.registerDto.confirmPassword = this.confirmPassword;

  this.ServiceA.register(this.registerDto).subscribe({
    next: (response) => {
      this.ShowRegisterSection = false;
      this.AccountVisible = false;
      this.ShowVerificationSection = true;
      this.messageService.add({ severity: 'success', summary: 'Inscription réussie', detail: 'Veuillez vérifier votre compte via l\'email envoyé.', life: 3000 });
    },
    error: (error) => {
      const msg = error.error;
      const detail = msg === 'Cet email est déjà utilisé.' || msg === 'Ce nom de société est déjà utilisé.' ? msg : 'Erreur inconnue.';
      this.messageService.add({ severity: 'error', summary: 'Erreur d\'inscription', detail, life: 3000 });
    }
  });
}



  showLoginSection() {
    this.companyVisible = false;
    this.AccountVisible = false;
    this.ShowLoginSection = true;
    this.ShowRegisterSection = false;
    this.ShowResetPasswordSection = false;
  }
  
  showRegisterSection() {
    this.companyVisible = true;
    this.ShowLoginSection = false;
    this.ShowRegisterSection = true;
  }
  ShowLoginSection = true;
  ShowRegisterSection = false



  ShowVerificationSection = false;
  verificationCode = '';
  resendDisabled = false;




  
  resendCode() {
    this.resendDisabled = true;
    this.ServiceA.resendVerification(this.registerDto.email).subscribe({
      next: () => {
        setTimeout(() => this.resendDisabled = false, 30000); // re-enable after 30 sec
      },
      error: () => {
        this.resendDisabled = false;
      }
    });
  }

  ShowResetPasswordSection: boolean = false;
  resetPasswordRequest = {
    email: ''
  };

  // Method to display the reset password section
  showResetPasswordSection(): void {
    this.ShowResetPasswordSection = true;
    this.ShowLoginSection = false;
  }

// Method to send the reset password link
sendResetPasswordLink(): void {
  if (!this.resetPasswordRequest.email) {
    this.messageService.add({
      severity: 'error',
      summary: 'Email manquant',
      detail: 'Veuillez saisir votre adresse email.',
      life: 3000
    });
    return;
  }

  if (!this.emailPattern.test(this.resetPasswordRequest.email)) {
    this.messageService.add({
      severity: 'error',
      summary: 'Email invalide',
      detail: 'Veuillez saisir une adresse email valide.',
      life: 3000
    });
    return;
  }

  // Disable the button and start cooldown
  this.isButtonDisabled = true;
  localStorage.setItem('resetButtonTimestamp', Date.now().toString());

  // Call your service to send the reset password link to the user's email
  this.ServiceA.forgotPassword(this.resetPasswordRequest.email).subscribe({
    next: (response) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Email envoyé',
        detail: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
        life: 3000
      });
      
      // Lock the button for 30 minutes
      setTimeout(() => {
        this.isButtonDisabled = false;
        localStorage.removeItem('resetButtonTimestamp');
      }, 30 * 60 * 1000); // 30 minutes
    },
    error: (error) => {
      // Handle specific error cases
      if (error.error === 'Utilisateur non trouvé') {
        this.messageService.add({
          severity: 'error',
          summary: 'Utilisateur non trouvé',
          detail: 'Aucun compte n\'est associé à cette adresse email.',
          life: 3000
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de l\'envoi du lien de réinitialisation.',
          life: 3000
        });
      }
      
      // Reset button state on error
      this.isButtonDisabled = false;
      localStorage.removeItem('resetButtonTimestamp');
    }
  });
}

  captchaToken: string | null = null;

  handleCaptcha(token: string | null): void {
    if (!token) {
      console.warn('Captcha token is null');
      return;
    }

    this.captchaToken = token;
    console.log('reCAPTCHA token:', token);

    // Call your service to verify the token
    this.captchaService.verifyCaptcha(token).subscribe({
      next: (response) => {
        console.log('Captcha verification response:', response);
        if (response.success) {
          // proceed with your login or form submission
          console.log('Captcha verified successfully');
        } else {
          console.warn('Captcha verification failed');
          // handle failure (show message, etc.)
        }
      },
      error: (error) => {
        console.error('Captcha verification error:', error);
        // handle error properly
      }
    });
  }

  // Dialog visibility state
  displayTerms: boolean = false;
  
  // Terms acceptance state
  acceptTerms: boolean = false;
  
  // Button hover state (for animations)
  hoverAccept: boolean = false;

  /**
   * Shows the terms dialog and resets acceptance state
   * @param event MouseEvent from the trigger element
   */
  showTerms(event: MouseEvent): void {
    event.preventDefault(); // Prevent default link behavior
    this.displayTerms = true;
    this.acceptTerms = false; // Reset acceptance state when dialog opens
    this.hoverAccept = false; // Reset hover state
  }

  /**
   * Handles terms acceptance
   */
  onAccept(): void {
    if (this.acceptTerms) {
      // Perform acceptance actions:
      console.log('Terms accepted');
      
      // Close the dialog
      this.displayTerms = false;
      
      // Additional actions you might want:
      // this.storeAcceptance();
      // this.emitAcceptance();
    }
  }

  /**
   * Handles dialog dismissal
   */
  onDismiss(): void {
    this.displayTerms = false;
    console.log('Terms dialog dismissed');
  }

  // Optional: Store acceptance in localStorage
  private storeAcceptance(): void {
    localStorage.setItem('termsAccepted', 'true');
  }

  onCheckboxChange() {
  // This triggers Angular's change detection
}


filteredAdresses: string[] = [];

search(event: any) {
  const query = event.query.toLowerCase();
  this.filteredAdresses = this.adresseOptions
    .filter(addr => addr.label.toLowerCase().includes(query))
    .map(addr => addr.label);
}

showWelcome: boolean = true;

goToLogin() {
  this.showWelcome = false;
}







}

