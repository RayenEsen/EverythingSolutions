import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../Services/theme.service';

@Component({
  selector: 'app-PaymentSuccess',
  templateUrl: './PaymentSuccess.component.html',
  styleUrls: ['./PaymentSuccess.component.css']
})
export class PaymentSuccessComponent implements OnInit {

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
