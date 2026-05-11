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
  chevronForwardOutline,
  chatbubbleEllipsesOutline,
  informationCircleOutline,
  linkOutline,
  schoolOutline,
  libraryOutline,
  bookOutline,
  openOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-bacheca-studente',
  templateUrl: './bacheca-studente.page.html',
  styleUrls: ['./bacheca-studente.page.scss'],
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
export class BachecaStudentePage {
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
      chevronForwardOutline,
      chatbubbleEllipsesOutline,
      informationCircleOutline,
      linkOutline,
      schoolOutline,
      libraryOutline,
      bookOutline,
      openOutline
    });
  }
}