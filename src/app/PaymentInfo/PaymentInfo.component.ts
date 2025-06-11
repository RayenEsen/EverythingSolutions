import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../Services/theme.service';
import { PaymentService } from '../Services/payment.service';
import { PaymentRequest } from '../Services/payment.models';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-PaymentInfo',
  templateUrl: './PaymentInfo.component.html',
  styleUrls: ['./PaymentInfo.component.css']
})
export class PaymentInfoComponent implements OnInit {

  constructor(
    private themeService: ThemeService,
    private paymentService: PaymentService,
    private router: Router
  ) { }

  ngOnInit() {
    this.themeService.darkMode$.subscribe(isDark => {
      if (isDark) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    });
  }

  initiatePayment() {
    const amount = 75; // Set the amount to 75 DT
    const entrepriseInfoString = localStorage.getItem('entrepriseInfo');
    let entrepriseId: number | null = null;

    if (entrepriseInfoString) {
      try {
        const entrepriseInfo = JSON.parse(entrepriseInfoString);
        entrepriseId = entrepriseInfo.id;
      } catch (e) {
        console.error('Error parsing entrepriseInfo from localStorage:', e);
      }
    }

    if (!entrepriseId) {
      console.error('Entreprise ID not found in localStorage.');
      this.router.navigate(['/payment-fail']);
      return;
    }

    const paymentRequest: PaymentRequest = {
      amount: amount,
      entrepriseId: entrepriseId
    };

    this.paymentService.createPayment(paymentRequest).subscribe({
      next: (response: any) => {
        if (response.data && response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl; // Redirect to Paymee
        } else {
          console.error('Payment URL missing from response');
          this.router.navigate(['/payment-fail']);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Payment initiation failed', error);
        this.router.navigate(['/payment-fail']);
      }
    });
  }
} 