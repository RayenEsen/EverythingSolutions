import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../Services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  constructor(public themeService: ThemeService) { }

  ngOnInit(): void {
    // Subscribe to dark mode changes
    this.themeService.darkMode$.subscribe(isDark => {
      setTimeout(() => {
        this.updateLottieBackground(isDark);
      }, 100);
    });
  }

  ngAfterViewInit() {
    // Set initial background
    setTimeout(() => {
      this.updateLottieBackground(this.themeService.isDarkMode());
    }, 1000);
  }

  private updateLottieBackground(isDark: boolean) {
    const iframe = document.querySelector('.lottie-animation') as HTMLIFrameElement;
    if (iframe) {
      const style = `
        html {
          background-color: ${isDark ? '#1a202c' : 'transparent'} !important;
        }
      `;

      iframe.onload = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const styleElement = iframeDoc.createElement('style');
            styleElement.textContent = style;
            iframeDoc.head.appendChild(styleElement);
          }
        } catch (e) {
          console.log('Could not access iframe content');
        }
      };
    }
  }

}
