import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../Services/theme.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('lottieFrame') lottieFrame!: ElementRef;
  public lottieUrl: SafeResourceUrl;

  constructor(
    public themeService: ThemeService,
    private sanitizer: DomSanitizer
  ) {
    this.lottieUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://lottie.host/embed/1567d7f9-1170-415a-b174-9985f1126721/kPDyPGCn6o.lottie'
    );
  }

  ngOnInit(): void {
    // If we're starting in dark mode, we need to pre-initialize the background
    if (this.themeService.isDarkMode()) {
      const checkInterval = setInterval(() => {
        const iframe = document.querySelector('.lottie-animation') as HTMLIFrameElement;
        if (iframe) {
          this.updateIframeBackground(true);
          clearInterval(checkInterval);
        }
      }, 100);

      // Clear interval after 5 seconds to prevent infinite checking
      setTimeout(() => clearInterval(checkInterval), 5000);
    }

    // Subscribe to dark mode changes
    this.themeService.darkMode$.subscribe(isDark => {
      this.updateIframeBackground(isDark);
    });
  }

  ngAfterViewInit() {
    if (this.lottieFrame?.nativeElement) {
      const iframe = this.lottieFrame.nativeElement as HTMLIFrameElement;
      
      // Set initial background
      this.updateIframeBackground(this.themeService.isDarkMode());
      
      // Add load event listener
      iframe.onload = () => {
        // When iframe loads, immediately apply theme and set up a few retries
        this.applyThemeWithRetry(this.themeService.isDarkMode());
      };
    }
  }

  private applyThemeWithRetry(isDark: boolean, attempts = 0, maxAttempts = 5) {
    this.updateIframeBackground(isDark);
    
    if (attempts < maxAttempts) {
      setTimeout(() => {
        this.applyThemeWithRetry(isDark, attempts + 1, maxAttempts);
      }, 200 * (attempts + 1)); // Increasing delay with each attempt
    }
  }

  private updateIframeBackground(isDark: boolean) {
    if (!this.lottieFrame?.nativeElement) return;

    const iframe = this.lottieFrame.nativeElement as HTMLIFrameElement;
    const backgroundColor = isDark ? '#1a202c' : '#f8fafc';
    
    // Update iframe's own background
    iframe.style.backgroundColor = backgroundColor;

    try {
      // Try to update the iframe content
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const css = `
          html, body {
            background-color: ${backgroundColor} !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          lottie-player, svg {
            background: ${backgroundColor} !important;
          }
        `;

        // Remove any existing theme styles first
        const existingStyle = iframeDoc.getElementById('theme-style');
        if (existingStyle) {
          existingStyle.remove();
        }

        // Create or update style element
        const style = iframeDoc.createElement('style');
        style.id = 'theme-style';
        style.textContent = css;
        iframeDoc.head.appendChild(style);

        // Force immediate application to body and html
        iframeDoc.documentElement.style.backgroundColor = backgroundColor;
        iframeDoc.body.style.backgroundColor = backgroundColor;
      }
    } catch (e) {
      console.warn('Could not access iframe content - this is expected on first load', e);
    }
  }
}