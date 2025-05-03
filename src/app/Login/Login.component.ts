import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

import { Entreprise } from '../shared/Entreprise';
import { AuthService } from '../shared/Auth.service';
import { LoginRequest } from '../DTO/LoginRequest';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './Login.component.html',
  styleUrls: ['./Login.component.css'],
  imports: [CommonModule, ButtonModule, InputTextModule, FormsModule, ToastModule],
  providers: [MessageService]
})
export class LoginComponent implements OnInit {

  constructor(public ServiceA: AuthService, private messageService: MessageService, private router: Router) {}

  ngOnInit() {}

  entreprise = new Entreprise();
  confirmPassword = '';
  companyVisible = true;
  BankVisible = false;
  AccountVisible = false;
  loginRequest = new LoginRequest();

  emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  showCompanyForm() {
    this.companyVisible = true;
    this.BankVisible = false;
    this.AccountVisible = false;
  }

  showBankForm() {
    this.companyVisible = false;
    this.BankVisible = true;
    this.AccountVisible = false;
  }

  showAccountForm() {
    this.companyVisible = false;
    this.BankVisible = false;
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
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la connexion, veuillez réessayer.',
          life: 3000
        });
      }
    );
  }

  Register() {
    if (!this.entreprise.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Email manquant',
        detail: 'Veuillez saisir votre adresse e-mail.',
        life: 3000
      });
      return;
    }

    if (!this.emailPattern.test(this.entreprise.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Email invalide',
        detail: 'Veuillez saisir une adresse e-mail valide.',
        life: 3000
      });
      return;
    }

    if (!this.entreprise.password) {
      this.messageService.add({
        severity: 'error',
        summary: 'Mot de passe manquant',
        detail: 'Veuillez saisir un mot de passe.',
        life: 3000
      });
      return;
    }

    if (!this.passwordPattern.test(this.entreprise.password)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Mot de passe faible',
        detail: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
        life: 3000
      });
      return;
    }

    if (this.entreprise.password !== this.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Les mots de passe ne correspondent pas',
        detail: 'Veuillez vérifier que les mots de passe sont identiques.',
        life: 3000
      });
      return;
    }

    this.ServiceA.register(this.entreprise).subscribe(
      (response) => {
        console.log("Inscription réussie", response);
        this.showLoginSection();
        this.messageService.add({
          severity: 'success',
          summary: 'Inscription réussie',
          detail: 'Bienvenue sur la plateforme !',
          life: 3000
        });
      },
      (error) => {
        console.error("Échec de l’inscription", error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.message || 'Échec de l’inscription',
          life: 3000
        });
      }
    );
  }

  onSubmit(): boolean {
    if (!this.entreprise.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Email manquant',
        detail: 'Veuillez saisir votre adresse e-mail.',
        life: 3000
      });
      return false;
    }

    if (!this.emailPattern.test(this.entreprise.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Email invalide',
        detail: 'Veuillez saisir une adresse e-mail valide.',
        life: 3000
      });
      return false;
    }

    if (!this.entreprise.password) {
      this.messageService.add({
        severity: 'error',
        summary: 'Mot de passe manquant',
        detail: 'Veuillez saisir votre mot de passe.',
        life: 3000
      });
      return false;
    }

    if (!this.passwordPattern.test(this.entreprise.password)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Mot de passe faible',
        detail: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
        life: 3000
      });
      return false;
    }

    if (this.entreprise.password !== this.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Les mots de passe ne correspondent pas',
        detail: 'Veuillez vérifier que les mots de passe sont identiques.',
        life: 3000
      });
      return false;
    }

    return true;
  }

  showLoginSection() {
    this.companyVisible = false;
    this.BankVisible = false;
    this.AccountVisible = false;
  }
}
