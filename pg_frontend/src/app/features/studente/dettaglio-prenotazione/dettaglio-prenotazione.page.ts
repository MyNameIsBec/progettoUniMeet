import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  notificationsOutline,
  chevronBackOutline,
  chevronForwardOutline,
  checkmarkCircleOutline,
  bookOutline,
  timeOutline,
  hourglassOutline,
  locationOutline,
  chatbubbleEllipsesOutline,
  documentTextOutline,
  documentOutline,
  documentAttachOutline,
  downloadOutline,
  mapOutline,
  navigateOutline,
  walkOutline,
  closeCircleOutline
} from 'ionicons/icons';

import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-dettaglio-prenotazione',
  templateUrl: './dettaglio-prenotazione.page.html',
  styleUrls: ['./dettaglio-prenotazione.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,

    IonContent,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,

    DashboardLayoutComponent
  ]
})
export class DettaglioPrenotazionePage {
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
      notificationsOutline,
      chevronBackOutline,
      chevronForwardOutline,
      checkmarkCircleOutline,
      bookOutline,
      timeOutline,
      hourglassOutline,
      locationOutline,
      chatbubbleEllipsesOutline,
      documentTextOutline,
      documentOutline,
      documentAttachOutline,
      downloadOutline,
      mapOutline,
      navigateOutline,
      walkOutline,
      closeCircleOutline
    });
  }
}