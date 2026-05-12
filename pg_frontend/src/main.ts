import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { intercettoreAutenticazione } from './app/core/interceptors/auth-interceptor';
import { addIcons } from 'ionicons';

import {
  calendarOutline,
  calendarClearOutline,
  calendarNumberOutline,
  timeOutline,
  locationOutline,
  arrowForwardOutline,
  chevronForwardOutline,
  personOutline,
  helpCircleOutline
} from 'ionicons/icons';

addIcons({
  calendarOutline,
  calendarClearOutline,
  calendarNumberOutline,
  timeOutline,
  locationOutline,
  arrowForwardOutline,
  chevronForwardOutline,
  personOutline,
  helpCircleOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)), 
    provideHttpClient(withInterceptors([intercettoreAutenticazione])),
  ],
});
