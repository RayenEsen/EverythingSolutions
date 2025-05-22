import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {

  constructor(public ServiceA: AuthService, private messageService: MessageService , private router: Router , private captchaService: CaptchaService ) {}

  isButtonDisabled: boolean = false;

  ngOnInit(): void {
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

  

 Register() {

if (!this.acceptTerms) {
  this.messageService.add({
    severity: 'error',
    summary: 'Conditions non acceptées',
    detail: 'Veuillez accepter les Conditions Générales d’Utilisation.',
    life: 3000
  });
  return;
}

if (!this.captchaToken) {
  this.messageService.add({
    severity: 'error',
    summary: 'CAPTCHA requis',
    detail: 'Veuillez compléter le CAPTCHA.',
    life: 3000
  });
  return;
}

  // Check if adresseComplete is filled
  if (!this.registerDto.adresseComplete || this.registerDto.adresseComplete.trim() === '') {
    this.messageService.add({
      severity: 'error',
      summary: 'Adresse complète manquante',
      detail: 'Veuillez remplir l’adresse complète.',
      life: 3000
    });
    return;
  }

// Check if adresse is selected
if (!this.registerDto.adresseEntreprise || this.registerDto.adresseEntreprise.trim() === '') {
  this.messageService.add({
    severity: 'error',
    summary: 'Adresse manquante',
    detail: 'Veuillez choisir une adresse valide.',
    life: 3000
  });
  return;
}

// Check if adresse is one of the allowed options
const isAdresseValid = this.adresseOptions.some(
  option => option.value === this.registerDto.adresseEntreprise
);if (!isAdresseValid) {
  this.messageService.add({
    severity: 'error',
    summary: 'Adresse invalide',
    detail: 'L’adresse choisie n’est pas reconnue.',
    life: 3000
  });
  return;
}


    
  
    // Validate email
    if (!this.registerDto.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Email manquant',
        detail: 'Veuillez saisir votre adresse e-mail.',
        life: 3000
      });
      return;
    }
  
    if (!this.emailPattern.test(this.registerDto.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Email invalide',
        detail: 'Veuillez saisir une adresse e-mail valide.',
        life: 3000
      });
      return;
    }
  
    // Validate password
    if (!this.registerDto.password) {
      this.messageService.add({
        severity: 'error',
        summary: 'Mot de passe manquant',
        detail: 'Veuillez saisir un mot de passe.',
        life: 3000
      });
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
  
    // Check if passwords match
    if (this.registerDto.password !== this.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Les mots de passe ne correspondent pas',
        detail: 'Veuillez vérifier que les mots de passe sont identiques.',
        life: 3000
      });
      return;
    }



// Validate the matricule fiscale
const matriculeFiscalePattern = /^[0-9]{7}[A-Z]{3}$/;
if (!matriculeFiscalePattern.test(this.registerDto.matriculeFiscale)) {
  this.messageService.add({
    severity: 'error',
    summary: 'Matricule invalide',
    detail: 'Le matricule fiscal doit contenir 7 chiffres suivis de 3 lettres majuscules (ex: 1234567ABC).',
    life: 3000
  });
  return;
}


    // Optionally copy confirmPassword into the DTO (if your backend expects it)
    this.registerDto.confirmPassword = this.confirmPassword;
  
// Proceed with registration
this.ServiceA.register(this.registerDto).subscribe(
  (response) => {
    console.log("Inscription réussie", response);
    this.ShowRegisterSection = false;
    this.AccountVisible = false;
    this.ShowVerificationSection = true;
    this.messageService.add({
      severity: 'success',
      summary: 'Inscription réussie',
      detail: 'Bienvenue sur la plateforme !',
      life: 3000
    });
  },
  (error) => {
    if (error.status === 400) {
      // Handle specific validation error like email already in use
      if (error.error === "Cet email est déjà utilisé.") {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur d’inscription',
          detail: 'Cet email est déjà utilisé.',
          life: 3000
        });
      } else if (error.error === "Ce nom de société est déjà utilisé.") {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur d’inscription',
          detail: 'Ce nom de société est déjà utilisé.',
          life: 3000
        });
      } else {
        // Handle other validation errors
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue, veuillez réessayer.',
          life: 3000
        });
      }
    } else {
      // Handle general error cases
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de serveur',
        detail: 'Une erreur est survenue, veuillez réessayer.',
        life: 3000
      });
    }
    console.error("Échec de l’inscription", error);
  }
);

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
  if (this.resetPasswordRequest.email) {
    // Disable the button and start cooldown
    this.isButtonDisabled = true;

    // Call your service to send the reset password link to the user's email
    this.ServiceA.forgotPassword(this.resetPasswordRequest.email).subscribe(
      response => {
        console.log('Reset link sent successfully');
        // Handle successful reset request (e.g., show success message)
      },
      error => {
        console.error('Error sending reset link:', error);
        // Handle error (e.g., show error message)
      }
    );

    // Lock the button for 30 minutes
    setTimeout(() => {
      this.isButtonDisabled = false; // Enable button after 30 minutes
    }, 30 * 60 * 1000); // 30 minutes
  } else {
    console.log('Email is required');
  }
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


}

