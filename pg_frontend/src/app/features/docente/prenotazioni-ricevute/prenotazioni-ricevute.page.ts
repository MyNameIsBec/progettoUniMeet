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
  helpCircleOutline,
  personOutline,
  logOutOutline,
  notificationsOutline,
  chevronDownOutline,
  chevronForwardOutline,
  statsChartOutline,
  hourglassOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  searchOutline,
  filterOutline,
  timeOutline,
  locationOutline,
  chatbubbleEllipsesOutline,
  downloadOutline,
  flashOutline,
  informationCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-prenotazioni-ricevute',
  templateUrl: './prenotazioni-ricevute.page.html',
  styleUrls: ['./prenotazioni-ricevute.page.scss'],
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
export class PrenotazioniRicevutePage {
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
      chevronForwardOutline,
      statsChartOutline,
      hourglassOutline,
      checkmarkCircleOutline,
      documentTextOutline,
      searchOutline,
      filterOutline,
      timeOutline,
      locationOutline,
      chatbubbleEllipsesOutline,
      downloadOutline,
      flashOutline,
      informationCircleOutline
    });
  }
}