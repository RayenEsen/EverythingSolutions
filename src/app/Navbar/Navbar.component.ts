import { Component, EventEmitter, Output, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ThemeService } from '../Services/theme.service';
import { AuthService } from '../shared/Auth.service'; // <-- Import
import { Router } from '@angular/router'; // <-- Pour navigation après logout
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  @ViewChild('notificationsDropdown') notificationsDropdownRef!: ElementRef;

  constructor(
    public themeService: ThemeService,
    private authService: AuthService, 
    private router: Router 
  ) {}

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();

    if (this.themeService.isDarkMode()) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
    onToggleSidebar(): void {
      this.toggleSidebar.emit();
    }

    isProfileMenuOpen = false;

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']); 
    });
  }

  // --- Search & Autocomplete ---
  searchTerm: string = '';
  filteredPages: { name: string, path: string }[] = [];
  pages: { name: string, path: string }[] = [
    { name: 'Accueil', path: '/' },
    { name: 'Clients', path: '/Client' },
    { name: 'Banques', path: '/Banque' },
    { name: 'Articles', path: '/ListArticle' },
    { name: 'Fournisseurs', path: '/Fournisseur' },
    { name: 'Devis', path: '/Devis' },
    { name: 'Retraits', path: '/Trait' },
    { name: 'Retenues', path: '/Retenue' },
    { name: 'Stock', path: '/Stock' },
    { name: 'Profil', path: '/Profil' },
    { name: 'Dashboard', path: '/Dashboard' },
    { name: 'TVA', path: '/TVA' },
    { name: 'Comming Soon', path: '/CommingSoon' },
    // Add more as needed, matching app.routes.ts
  ];
  showSuggestions: boolean = false;
  searchFocused: boolean = false;

  onSearchInput(event: any): void {
    const value = this.searchTerm.toLowerCase();
    console.log('Input:', value);
    this.filteredPages = this.pages.filter(page =>
      page.name.toLowerCase().includes(value)
    );
    this.showSuggestions = !!value && this.filteredPages.length > 0 && this.searchFocused;
    console.log('Filtered:', this.filteredPages);
  }

  onSuggestionClick(page: { name: string, path: string }): void {
    console.log('Clicked page:', page);
    this.router.navigate([page.path]);
    this.searchTerm = '';
    this.filteredPages = [];
    this.showSuggestions = false;
    this.searchFocused = false;
  }

  onSearchEnter(): void {
    if (this.filteredPages.length > 0) {
      this.onSuggestionClick(this.filteredPages[0]);
    }
  }

  onSearchFocus(): void {
    this.searchFocused = true;
    this.showSuggestions = !!this.searchTerm && this.filteredPages.length > 0;
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.searchFocused = false;
      this.showSuggestions = false;
    }, 150); // Delay to allow click
  }

  notifications = [
    {
      id: 'devis-2024',
      icon: 'bx bx-file',
      title: 'Nouvelle fonctionnalité',
      message: 'Nous avons ajouté la fonctionnalité Devis !',
      read: false,
      date: new Date()
    },
    {
      id: 'welcome-2024',
      icon: 'bx bx-party',
      title: 'Bienvenue !',
      message: 'Merci d\'utiliser Quick Soft.',
      read: false,
      date: new Date(Date.now() - 86400000)
    }
    // Add more notifications with unique ids as needed
  ];
  showNotificationsDropdown = false;

  ngOnInit(): void {
    const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    this.notifications.forEach(n => {
      n.read = readIds.includes(n.id);
    });
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleNotificationsDropdown() {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
    if (this.showNotificationsDropdown) {
      // Mark all as read and persist
      this.notifications.forEach(n => n.read = true);
      const ids = this.notifications.map(n => n.id);
      localStorage.setItem('readNotifications', JSON.stringify(ids));
    }
  }

  // Close dropdown on click outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showNotificationsDropdown) return;
    const dropdown = this.notificationsDropdownRef?.nativeElement;
    const bell = document.querySelector('.bx.bx-bell');
    const target = event.target as Node;
    if (dropdown && !dropdown.contains(target) && bell && !bell.contains(target)) {
      this.showNotificationsDropdown = false;
    }
  }

  get entrepriseInfo(): any {
    return JSON.parse(localStorage.getItem('entrepriseInfo') || '{}');
  }

  get entrepriseImageUrl(): string {
    return this.entrepriseInfo.imageUrl || 'https://i.ibb.co/5GzXkw3/user-avatar.png';
  }

  get entrepriseName(): string {
    return this.entrepriseInfo.nomSociete || '';
  }
}