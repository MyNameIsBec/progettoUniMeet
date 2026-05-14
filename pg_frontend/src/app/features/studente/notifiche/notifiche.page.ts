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

import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';

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
  chevronDownOutline,
  chevronForwardOutline,
  mailUnreadOutline,
  mailOpenOutline,
  timeOutline,
  megaphoneOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  closeCircleOutline,
  trashOutline,
  settingsOutline,
  informationCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-notifiche',
  templateUrl: './notifiche.page.html',
  styleUrls: ['./notifiche.page.scss'],
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
    DashboardLayoutComponent
  ]
})
export class NotifichePage {
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
      chevronDownOutline,
      chevronForwardOutline,
      mailUnreadOutline,
      mailOpenOutline,
      timeOutline,
      megaphoneOutline,
      checkmarkCircleOutline,
      documentTextOutline,
      closeCircleOutline,
      trashOutline,
      settingsOutline,
      informationCircleOutline
    });
  }
}