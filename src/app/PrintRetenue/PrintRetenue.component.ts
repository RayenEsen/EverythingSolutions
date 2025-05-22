import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';


import { RetenuesService } from '../Services/Retenue.service';
import { RetenueDto } from '../DTO/RetenueDto';
import { AuthService } from '../shared/Auth.service';
@Component({
  selector: 'app-PrintRetenue',
  templateUrl: './PrintRetenue.component.html',
  styleUrls: ['./PrintRetenue.component.css'],
    imports: [
    CommonModule,
    ]
})
export class PrintRetenueComponent implements OnInit {
  retenue!: RetenueDto;

  constructor(
    private route: ActivatedRoute,
    private retenuesService: RetenuesService,
    private ServiceA : AuthService
  ) {}

  entrepriseInfo: any;
  protectedData : any;
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
