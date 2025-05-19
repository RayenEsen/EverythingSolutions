import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResetPasswordRequest } from '../DTO/ResetPasswordRequest';  // Adjust the import based on your DTO location
import { AuthService } from '../shared/Auth.service';  // Adjust the import based on your service location
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './ResetPassword.component.html',
  styleUrls: ['./ResetPassword.component.css'],
  imports: [CommonModule, FormsModule],
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router  // Inject the router here
) {}

  ngOnInit(): void {
    // Get the token from the URL query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];  // Capture the token from the URL
      console.log('Reset password token:', this.token);
    });
  }

onSubmit(): void {
  // Check if the passwords match
  if (this.newPassword !== this.confirmPassword) {
    alert('Les mots de passe ne correspondent pas');
    return;
  }

  const resetPasswordData: ResetPasswordRequest = {
    token: this.token,
    newPassword: this.newPassword
  };

  this.authService.resetPassword(resetPasswordData).subscribe({
    next: (response: any) => {
      this.router.navigate(['/login']);  // Redirect to login page
    },
    error: (err: any) => {
      console.error('Password reset failed:', err);
      alert('Une erreur est survenue, veuillez réessayer.');
    }
  });
}

}
