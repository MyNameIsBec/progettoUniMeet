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
  helpCircleOutline,
  personOutline,
  logOutOutline,
  notificationsOutline,
  chevronDownOutline,
  statsChartOutline,
  addCircleOutline,
  hourglassOutline,
  pieChartOutline,
  timeOutline,
  locationOutline,
  listOutline,
  arrowForwardOutline,
  documentTextOutline,
  documentOutline,
  documentAttachOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-bacheca-docente',
  templateUrl: './bacheca-docente.page.html',
  styleUrls: ['./bacheca-docente.page.scss'],
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
export class BachecaDocentePage {
  constructor() {
    addIcons({
      calendarOutline,
      calendarClearOutline,
      calendarNumberOutline,
      homeOutline,
      helpCircleOutline,
      personOutline,
      logOutOutline,
      notificationsOutline,
      chevronDownOutline,
      statsChartOutline,
      addCircleOutline,
      hourglassOutline,
      pieChartOutline,
      timeOutline,
      locationOutline,
      listOutline,
      arrowForwardOutline,
      documentTextOutline,
      documentOutline,
      documentAttachOutline
    });
  }
}