import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Entreprise } from '../shared/Entreprise';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/Auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './Login.component.html',
  styleUrls: ['./Login.component.css'],
  imports: [CommonModule, ButtonModule, InputTextModule, FormsModule]
})



export class LoginComponent implements OnInit {

  constructor(public ServiceA: AuthService) { }

  ngOnInit() {
  }


  entreprise = new Entreprise();
  confirmPassword = "";
  companyVisible = true;
  BankVisible = false;
  AccountVisible = false;

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
    this.ServiceA.login(this.entreprise).subscribe(
      (response) => {
        console.log("Login successful", response);
        // Handle successful login here, e.g., redirect to another page
      },
      (error) => {
        console.error("Login failed", error);
        // Handle login error here, e.g., show an error message
      }
    );
  }
  Register() {
    this.ServiceA.register(this.entreprise).subscribe(
      (response) => {
        console.log("Registration successful", response);
        // Handle successful registration here, e.g., redirect to another page
      },
      (error) => {
        console.error("Registration failed", error);
        // Handle registration error here, e.g., show an error message
      }
    );
  }
  // Function to handle form submission
  onSubmit() {
    if (this.entreprise.password !== this.confirmPassword) {
      console.error("Passwords do not match");
      // Handle password mismatch error here, e.g., show an error message
      return;
    }
  }


}

