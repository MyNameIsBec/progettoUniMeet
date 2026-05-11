import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonRouterOutlet
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  calendarOutline,
  calendarClearOutline,
  calendarNumberOutline,
  homeOutline,
  peopleOutline,
  helpCircleOutline,
  personOutline,
  logOutOutline,
  menuOutline,
  notificationsOutline,
  chevronDownOutline,
  timeOutline,
  folderOutline,
  locationOutline,
  arrowForwardOutline,
  chevronForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard-studente',
  templateUrl: './dashboard-studente.page.html',
  styleUrls: ['./dashboard-studente.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonContent,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonRouterOutlet
  ]
})
export class DashboardStudentePage {
  constructor(private router: Router) {
    addIcons({
      calendarOutline,
      calendarClearOutline,
      calendarNumberOutline,
      homeOutline,
      peopleOutline,
      helpCircleOutline,
      personOutline,
      logOutOutline,
      menuOutline,
      notificationsOutline,
      chevronDownOutline,
      timeOutline,
      folderOutline,
      locationOutline,
      arrowForwardOutline,
      chevronForwardOutline
    });
  }

  isHome(): boolean {
    return this.router.url === '/dashboard-studente' || this.router.url === '/dashboard-studente/';
  }
}