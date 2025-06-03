import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as Highcharts from 'highcharts/highmaps';  // Highmaps build for maps
import { AuthService } from '../shared/Auth.service';
import { ChartModule } from 'primeng/chart';
import { EntrepriseLight } from '../DTO/EntrepriseLight';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { RetenuesService } from '../Services/Retenue.service';
import { RetraitesService } from '../Services/Trait.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [ChartModule,CommonModule,ButtonModule,TableModule,ToastModule,ConfirmDialogModule], // Import ChartModule for PrimeNG charts
  providers: [MessageService,ConfirmationService]

})
export class DashboardComponent implements OnInit, AfterViewInit {

  constructor(private ServiceT : RetraitesService,private ServiceR : RetenuesService,private serviceA : AuthService, private messageService: MessageService , private confirmationService: ConfirmationService,) {}

  AdminName: string = '';
  
  ngOnInit(): void {
    this.loadEntreprisesCreatedTodayCount();
    this.loadUsersProgress();
    this.AdminName = this.serviceA.getEntrepriseInfo().nomSociete || 'Entreprise inconnue';
    console.log('Admin Name:', this.AdminName);
    this.loadEntreprisesLight();
    this.loadStatsData();
    this.loadTraiteProgress();
    this.loadRetenueProgress();
    this.LoadRetenuesCreatedTodayCount();
    this.loadTraitesCreatedTodayCount();
  }

  ngAfterViewInit(): void {
    this.setupActiveNavLinks();
    this.animateProgressBars();
    this.preventButtonDefaults();
  }

  private setupActiveNavLinks(): void {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (event: Event) => {
        event.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

private loadStatsData(): void {
  this.serviceA.getStatsByGouvernorat().subscribe({
    next: (data) => {
      const formattedData = this.formatToHighchartsData(data);
      this.renderMap(formattedData);
        this.isLoadingMapData = false;
    },
    error: (err) => {
      console.error('Erreur lors du chargement des statistiques', err);
    }
  });
}


  private formatToHighchartsData(data: { gouvernorat: string, count: number }[]): { 'hc-key': string, value: number }[] {
    const govMap: { [key: string]: string } = {
      'Ariana': 'tn-ar',
      'Manouba': 'tn-mn',
      'Tunis': 'tn-tu',
      'Ben Arous': 'tn-ba',
      'Sfax': 'tn-sf',
      'Sousse': 'tn-su',
      'Gabès': 'tn-ga',
      'Gafsa': 'tn-gf',
      'Kairouan': 'tn-kr',
      'Kasserine': 'tn-ks',
      'Kebili': 'tn-ke',
      'Bizerte': 'tn-bi',
      'Beja': 'tn-bj',
      'Jendouba': 'tn-je',
      'Le Kef': 'tn-kf',
      'Mahdia': 'tn-md',
      'Medenine': 'tn-me',
      'Monastir': 'tn-mo',
      'Nabeul': 'tn-na',
      'Sidi Bouzid': 'tn-sb',
      'Siliana': 'tn-sl',
      'Tataouine': 'tn-ta',
      'Tozeur': 'tn-to',
      'Zaghouan': 'tn-za'
    };

    return data
      .map(item => {
        const hcKey = govMap[item.gouvernorat];
        return hcKey ? { 'hc-key': hcKey, value: item.count } : null;
      })
      .filter((item): item is { 'hc-key': string, value: number } => item !== null);
  }


  isLoadingMapData = true;

  private async renderMap(formattedData: { 'hc-key': string, value: number }[]): Promise<void> {
    try {
      const topology = await fetch('https://code.highcharts.com/mapdata/countries/tn/tn-all.topo.json').then(res => res.json());

      Highcharts.mapChart('map-container', {
        chart: {
          map: topology
        },
        title: {
          text: ''
        },
        mapNavigation: {
          enabled: true,
          buttonOptions: {
            verticalAlign: 'bottom'
          }
        },
        colorAxis: {
          min: 0,
          stops: [
            [0, '#EFEFFF'],   // Lightest blue
            [0.5, '#7BAAFF'], // Medium blue
            [1, '#003399']    // Dark blue
          ]
        },
        tooltip: {
          formatter: function (this: any) {
            const value = this.point.value ?? 0;
            return `<b>${this.point.name}</b><br/>Comptes créés : <b>${value}</b>`;
          }
        },
        series: [{
          type: 'map',
          data: formattedData,
          name: 'Comptes créés',
          states: {
            hover: {
              color: '#BADA55'
            }
          },
          dataLabels: {
            enabled: true,
            format: '{point.name}'
          }
        }]
      });
    } catch (error) {
      console.error('Error loading or rendering map:', error);
    }
  }
private animateNumbers(): void {
  const numbers = document.querySelectorAll('.stat-number');
  numbers.forEach(element => {
    const el = element as HTMLElement;
    const text = el.textContent || '';
    const target = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (isNaN(target)) return;

    let count = 0;

    // Adjust animation duration: smaller numbers = faster
    const baseDuration = 1500; // in ms
    const minDuration = 300;   // minimum duration for very small numbers
    const duration = Math.max(minDuration, baseDuration * Math.log10(target + 10) / 3);

    const steps = Math.floor(duration / 25); // 25ms per frame
    const increment = target / steps;

    const timer = setInterval(() => {
      count += increment;
      if (count >= target) {
        count = target;
        clearInterval(timer);
      }

      if (text.includes('$')) {
        el.textContent = '$' + Math.floor(count).toLocaleString();
      } else if (text.includes('%')) {
        el.textContent = (Math.floor(count * 10) / 10) + '%';
      } else {
        el.textContent = Math.floor(count).toLocaleString();
      }
    }, 25);
  });
}
private animateProgressBars(): void {
  const progressBars = document.querySelectorAll('.progress-bar');
  progressBars.forEach(bar => {
    const progressBar = bar as HTMLElement;

    const targetWidth = progressBar.getAttribute('data-target-width') || '0%';

    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';

    // Force reflow
    progressBar.offsetWidth;

    setTimeout(() => {
      progressBar.style.transition = 'width 1.5s ease-in-out';
      progressBar.style.width = targetWidth;
    }, 50);
  });
}



  private preventButtonDefaults(): void {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (event: Event) => {
        const button = btn as HTMLElement;
        if (!button.hasAttribute('data-bs-toggle')) {
          event.preventDefault();
        }
      });
    });
  }




data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Traites',
      data: [1200, 1900, 3000, 5000, 2300, 3400, 4200],
      fill: false,
      borderColor: '#000000', // black
      tension: 0.4
    },
    {
      label: 'Retenues',
      data: [800, 1600, 2100, 2800, 1900, 2200, 2700],
      fill: false,
      borderColor: '#0000ff', // blue
      tension: 0.4
    },
    {
      label: 'Entreprises',
      data: [400, 300, 900, 2200, 400, 1200, 1500],
      fill: false,
      borderColor: '#ff0000', // red
      tension: 0.4
    }
  ]
};

options = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

  entreprises: EntrepriseLight[] = [];

  loadEntreprisesLight() {
    this.serviceA.getEntreprisesLight().subscribe({
      next: (data) => {
        this.entreprises = data;
        console.log('Entreprises light data:', data);
      },
      error: (err) => {
        console.error('Error loading entreprises light:', err);
      }
    });
  }


exportUsers() {
  import("xlsx").then(xlsx => {
    const worksheet = xlsx.utils.json_to_sheet(this.entreprises);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
    const excelBuffer: any = xlsx.write(workbook, { bookType: "xlsx", type: "array" });
    this.saveAsExcelFile(excelBuffer, "utilisateurs");
  });
}

saveAsExcelFile(buffer: any, fileName: string): void {
  import("file-saver").then(module => {
    const FileSaver = module.default; // ⬅️ use `.default` when importing CommonJS module in ESM
    const data: Blob = new Blob([buffer], {
      type: this.EXCEL_TYPE
    });
    FileSaver.saveAs(data, `${fileName}_export_${new Date().getTime()}.xlsx`);
  });
}

readonly EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";



confirmDelete(id: number): void {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui',
    rejectLabel: 'Non',
    rejectButtonStyleClass: 'p-button-danger', // <-- this makes the "No" button red
    accept: () => {
      this.deleteEntrepriseById(id);
    }
  });
}


deleteEntrepriseById(id: number): void {
  this.serviceA.deleteEntreprise(id).subscribe({
    next: () => {
      // Retirer l'entreprise supprimée de la liste
      this.entreprises = this.entreprises.filter(e => e.id !== id);

      // Afficher un message de succès
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Entreprise supprimée avec succès'
      });
    },
    error: (error) => {
      console.error('Failed to delete entreprise:', error);

      // Afficher un message d'erreur
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec de la suppression de l\'entreprise'
      });
    }
  });
}



  countThisMonthTraite: number = 0;
  countLastMonthTraite: number = 0;
  growthTraite: number = 0;

loadTraiteProgress() {
  this.ServiceT.getRetraitesProgress().subscribe({
    next: (data) => {
      this.countThisMonthTraite = data.countThisMonth;
      this.countLastMonthTraite = data.countLastMonth;
      this.growthTraite = data.growth;

      // Animate progress bars after DOM updates
      setTimeout(() => {
        this.animateProgressBars();
      }, 0);
    },
    error: (err) => {
      console.error('Failed to load traite progress', err);
    },
  });
}

countThisMonthRetenue: number = 0;
countLastMonthRetenue: number = 0;
growthRetenue: number = 0;


loadRetenueProgress() {
  this.ServiceR.getRetenuesProgress().subscribe({
    next: (data) => {
      this.countThisMonthRetenue = data.countThisMonth;
      this.countLastMonthRetenue = data.countLastMonth;
      this.growthRetenue = data.growth;

      // Animate progress bars after DOM updates
      setTimeout(() => {
        this.animateProgressBars();
      }, 0);
    },
    error: (err) => {
      console.error('Failed to load retenue progress', err);
    },
  });
}

countThisMonthUsers: number = 0;
countLastMonthUsers: number = 0;
growthUsers: number = 0;

loadUsersProgress() {
  this.serviceA.getEntreprisesProgress().subscribe({
    next: (data) => {
      this.countThisMonthUsers = data.countThisMonth;
      this.countLastMonthUsers = data.countLastMonth;
      this.growthUsers = data.growth;
      console.log('Users progress data:', data);
      // Animate progress bars after DOM updates
      setTimeout(() => {
        this.animateProgressBars();
      }, 0);
    },
    error: (err) => {
      console.error('Failed to load users progress', err);
    },
  });
}

entreprisesCreatedTodayCount: number = 0;

loadEntreprisesCreatedTodayCount() {
  this.serviceA.getEntreprisesCreatedTodayCount().subscribe({
    next: (response) => {
      this.entreprisesCreatedTodayCount = response.count;
      console.log('Entreprises created today count:', this.entreprisesCreatedTodayCount);
    },
    error: (error) => {
      console.error('Failed to load entreprises created today count', error);
    }
  });
}

retenuesCreatedTodayCount: number = 0;

LoadRetenuesCreatedTodayCount() {
  this.ServiceR.getRetenuesCreatedTodayCount().subscribe({
    next: (response) => {
      this.retenuesCreatedTodayCount = response.count;
      console.log('Retenues created today count:', this.retenuesCreatedTodayCount);
    },
    error: (error) => {
      console.error('Failed to load retenues created today count', error);
    }
  });
}

TraitesCreatedTodayCount: number = 0;
loadTraitesCreatedTodayCount() {
  this.ServiceT.getRetraitesCreatedTodayCount().subscribe({
    next: (response) => {
      this.TraitesCreatedTodayCount = response.count;
      console.log('Traites created today count:', this.TraitesCreatedTodayCount);
    },
    error: (error) => {
      console.error('Failed to load traite created today count', error);
    }
  });
}

}

