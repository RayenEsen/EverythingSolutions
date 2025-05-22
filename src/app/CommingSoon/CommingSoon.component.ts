import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-CommingSoon',
  templateUrl: './CommingSoon.component.html',
  styleUrls: ['./CommingSoon.component.css']
})
export class CommingSoonComponent implements OnInit {

  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  ngOnInit() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7); // 1 semaine plus tard

    this.updateCountdown(targetDate);
    setInterval(() => this.updateCountdown(targetDate), 1000);
  }

  updateCountdown(target: Date) {
    const now = new Date().getTime();
    const distance = target.getTime() - now;

    if (distance <= 0) return;

    this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
  }
}
