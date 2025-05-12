import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RetraitesService } from '../Services/Trait.service';
import { RetraiteLightDto } from '../DTO/RetraiteLightDto';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-PrintTraite',
  templateUrl: './PrintTraite.component.html',
  styleUrls: ['./PrintTraite.component.css'],
  imports: [DatePipe , CommonModule],
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


   formatRIB(rib: string | undefined | null): string {
    if (!rib) return '';
  
    // Remove any non-digit characters
    rib = rib.replace(/\D/g, '');
  
    // Group digits according to your desired format
    const groups = [
      rib.slice(0, 2),     // 14
      rib.slice(2, 5),     // 124
      rib.slice(5, 8),     // 124
      rib.slice(8, 10),    // 10
      rib.slice(10, 12),   // 17
      rib.slice(12, 17),   // 00058
      rib.slice(17, 18),   // 5
      rib.slice(18, 20)    // 36
    ];
  
    // Join only non-empty groups
    return groups.filter(g => g).join('\u2003'); // visually wider than normal space
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


  
}
