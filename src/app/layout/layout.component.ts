import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../shared/Auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbarr.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, RouterOutlet]
})
export class LayoutComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;
  isAuthenticated = false;
  private authSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
      }
    });
    this.authService.checkSession().subscribe();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  getMainContentMargin(): string {
    if (!this.isAuthenticated) return '0';
    return this.isSidebarCollapsed ? '80px' : '260px';
  }
}