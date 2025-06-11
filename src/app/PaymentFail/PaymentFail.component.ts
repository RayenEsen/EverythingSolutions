import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../Services/theme.service';

@Component({
  selector: 'app-PaymentFail',
  templateUrl: './PaymentFail.component.html',
  styleUrls: ['./PaymentFail.component.css']
})
export class PaymentFailComponent implements OnInit {

  constructor(private themeService: ThemeService) { }

  ngOnInit() {
    this.themeService.darkMode$.subscribe(isDark => {
      if (isDark) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    });
  }

} 