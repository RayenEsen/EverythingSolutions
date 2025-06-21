import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../shared/Auth.service';
import { EntrepriseDetailsDto } from '../DTO/EntrepriseDetailsDto';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { ThemeService } from '../Services/theme.service';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-EntrepriseDetails',
  templateUrl: './EntrepriseDetails.component.html',
  styleUrls: ['./EntrepriseDetails.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    CardModule,
    FieldsetModule,
    DividerModule,
    ButtonModule,
    DataViewModule,
    TagModule,
    ChartModule,
    TableModule
  ]
})
export class EntrepriseDetailsComponent implements OnInit {
  entrepriseDetails: EntrepriseDetailsDto | undefined;
  chartData: any;
  chartOptions: any;
  
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.authService.getEntrepriseDetails(parseInt(id)).subscribe({
          next: (data) => {
            this.entrepriseDetails = data;
            console.log('Entreprise Details:', this.entrepriseDetails);
            this.updateChartDataAndOptions();
          },
          error: (err) => {
            console.error('Error fetching entreprise details:', err);
          }
        });
      }
    });
    this.themeService.darkMode$.subscribe(() => {
      this.updateChartDataAndOptions();
    });
  }

  updateChartDataAndOptions(): void {
    const isDarkMode = this.themeService.isDarkMode();
    const textColor = isDarkMode ? '#CED4DA' : '#495057';
    const textColorSecondary = isDarkMode ? '#AAB8C2' : '#6C757D';
    const surfaceBorder = isDarkMode ? '#5E6B7E' : '#DEE2E6';

    this.chartData = {
      labels: ['Retenues', 'Traites'],
      datasets: [
        {
          label: 'Nombre de Documents',
          backgroundColor: isDarkMode ? '#42A5F5' : '#42A5F5',
          borderColor: isDarkMode ? '#1E88E5' : '#1E88E5',
          data: [this.entrepriseDetails?.retenuesCount || 0, this.entrepriseDetails?.traitesCount || 0]
        }
      ]
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }
}
