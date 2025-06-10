import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { RetenuesService } from '../Services/Retenue.service';
import { RetenueDto } from '../DTO/RetenueDto';
import { AuthService } from '../shared/Auth.service';
import { ThemeService } from '../Services/theme.service';

@Component({
  selector: 'app-PrintRetenue',
  templateUrl: './PrintRetenue.component.html',
  styleUrls: ['./PrintRetenue.component.css'],
  imports: [
    CommonModule,
  ],
  standalone: true
})
export class PrintRetenueComponent implements OnInit {
  @HostBinding('class.dark-mode') isDarkMode = false;
  retenue!: RetenueDto;

  constructor(
    private route: ActivatedRoute,
    private retenuesService: RetenuesService,
    private ServiceA: AuthService,
    private themeService: ThemeService
  ) {
    this.themeService.darkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
  }

  entrepriseInfo: any;
  protectedData: any;
  stored = JSON.parse(localStorage.getItem('entrepriseInfo') || '{}');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.retenuesService.getRetenueById(id).subscribe({
        next: (data) => {
          this.retenue = data;
          console.log('Retenue fetched:', this.retenue);
        },
        error: (err) => {
          console.error('Error fetching retenue:', err);
        }
      });
    }
  }
}
