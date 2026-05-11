import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonSelect,
  IonSelectOption
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
  searchOutline,
  bookOutline,
  mailOutline,
  businessOutline,
  informationCircleOutline,
  checkmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-elenco-docenti',
  templateUrl: './elenco-docenti.page.html',
  styleUrls: ['./elenco-docenti.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonContent,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonSelect,
    IonSelectOption
  ]
})
export class ElencoDocentiPage {
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
      searchOutline,
      bookOutline,
      mailOutline,
      businessOutline,
      informationCircleOutline,
      checkmarkOutline
    });
  }
}