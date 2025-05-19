import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RetraitesService } from '../Services/Trait.service';
import { RetraiteLightDto } from '../DTO/RetraiteLightDto';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-PrintTraite',
  templateUrl: './PrintTraite.component.html',
  styleUrls: ['./PrintTraite.component.css'],
  imports: [DialogModule , DatePipe , CommonModule],
  standalone: true,
})
export class PrintTraiteComponent implements OnInit {
  retraiteDetails?: RetraiteLightDto;
  today = new Date();
  constructor(
    private route: ActivatedRoute,
    private retraitesService: RetraitesService
  ) { }

ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));
  if (id) {
    this.retraitesService.getRetraiteById(id).subscribe({
      next: (data) => this.retraiteDetails = Object.assign(new RetraiteLightDto(), data),
      error: (err) => console.error('Error loading retraite:', err)
    });
  }
}

getRibParts(rib: string | null | undefined): string[] {
  if (!rib) return [];

  rib = rib.replace(/\D/g, '');

  return [
    rib.slice(0, 2),
    rib.slice(2, 5),
    rib.slice(5, 8),
    rib.slice(8, 10),
    rib.slice(10, 12),
    rib.slice(12, 17),
    rib.slice(17, 18),
    rib.slice(18, 20)
  ];
}


   formatMontant(value: number | undefined | null): string {
    if (value == null) return '0.000';
    return value.toFixed(3);
  }


printRetraiteDetails(): void {
  
  // Add a class to hide unwanted elements during printing
  document.body.classList.add('print-mode');

  // Trigger the print dialog
  window.print();

  // Remove the class after printing
  window.onafterprint = () => {
    document.body.classList.remove('print-mode');
  };
}

displayDialog: boolean = false;

ViewTrait() {
  this.displayDialog = true;
}
  
}
