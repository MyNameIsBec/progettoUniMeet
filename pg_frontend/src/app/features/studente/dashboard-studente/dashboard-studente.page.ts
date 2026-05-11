import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton
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
    RouterLink,
    IonContent,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton
  ]
})
export class DashboardStudentePage {
  constructor() {
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
}