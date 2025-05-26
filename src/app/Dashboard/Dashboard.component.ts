import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as Highcharts from 'highcharts/highmaps';  // Highmaps build for maps
import { AuthService } from '../shared/Auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  constructor(private serviceA : AuthService) {}

  ngOnInit(): void {
    this.loadStatsData();
  }

  ngAfterViewInit(): void {
    this.setupActiveNavLinks();
    this.animateNumbers();
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
      const increment = target / 60;

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
      const targetWidth = progressBar.getAttribute('data-target-width') || progressBar.style.width || '0%';
      progressBar.style.width = '0%';

      setTimeout(() => {
        progressBar.style.transition = 'width 1.5s ease-in-out';
        progressBar.style.width = targetWidth;
      }, 200);
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
}
