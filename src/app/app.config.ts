import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient } from '@angular/common/http';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

import { fr } from 'primelocale/fr.json';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

const CustomPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      dark: {
        surface: {
          0: '#1a202c',  // Main background
          50: '#2d3748', // Secondary background
          100: '#2d3748',
          200: '#2d3748',
          300: '#4a5568',
          400: '#4a5568',
          500: '#4a5568',
          600: '#4a5568',
          700: '#4a5568',
          800: '#1a202c',
          900: '#1a202c',
          950: '#1a202c'
        },
        primary: {
          color: '#3b82f6',
          inverseColor: '#ffffff',
          hoverColor: '#2563eb',
          activeColor: '#1d4ed8'
        },
        text: {
          color: '#ffffff',
          secondaryColor: '#e2e8f0'
        }
      }
    }
  },
  components: {
    dialog: {
      colorScheme: {
        dark: {
          root: {
            background: '#2d3748',
            borderColor: '#4a5568'
          }
        }
      }
    },
    drawer: {
      colorScheme: {
        dark: {
          root: {
            background: '#2d3748',
            borderColor: '#4a5568'
          },
          content: {
            background: '#2d3748'
          }
        }
      }
    },
    inputtext: {
      colorScheme: {
        dark: {
          root: {
            background: '#1a202c',
            color: '#ffffff',
            borderColor: '#4a5568',
            hoverBorderColor: '#60a5fa'
          }
        }
      }
    },
    table: {
      colorScheme: {
        dark: {
          root: {
            background: '#2d3748',
            color: '#ffffff',
            borderColor: '#4a5568'
          },
          header: {
            background: '#1a202c',
            color: '#ffffff',
            borderColor: '#4a5568'
          },
          body: {
            cell: {
              background: '#2d3748',
              color: '#ffffff',
              borderColor: '#4a5568'
            }
          }
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    importProvidersFrom(ButtonModule, InputTextModule),
    provideAnimationsAsync(),
    providePrimeNG({
      translation: fr,
      theme: {
        preset: CustomPreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark-mode',
          cssLayer: false
        }
      }
    })
  ]
};
