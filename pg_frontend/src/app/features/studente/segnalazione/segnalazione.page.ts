import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  calendarClearOutline,
  calendarNumberOutline,
  calendarOutline,
  checkmarkCircleOutline,
  chevronDownOutline,
  cloudUploadOutline,
  createOutline,
  documentTextOutline,
  folderOpenOutline,
  headsetOutline,
  helpCircleOutline,
  homeOutline,
  informationCircleOutline,
  logOutOutline,
  notificationsOutline,
  paperPlaneOutline,
  peopleOutline,
  personOutline,
  sendOutline,
  shieldCheckmarkOutline,
  timeOutline,
} from 'ionicons/icons';
import { DashboardLayoutComponent } from 'src/app/components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-segnalazione',
  standalone: true,
  imports: [
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    RouterLink,
    DashboardLayoutComponent,
  ],
  templateUrl: './segnalazione.page.html',
  styleUrls: ['./segnalazione.page.scss'],
})
export class SegnalazionePage {
  constructor() {
    addIcons({
      calendarOutline,
      homeOutline,
      peopleOutline,
      calendarClearOutline,
      calendarNumberOutline,
      helpCircleOutline,
      notificationsOutline,
      personOutline,
      logOutOutline,
      alertCircleOutline,
      chevronDownOutline,
      headsetOutline,
      sendOutline,
      timeOutline,
      checkmarkCircleOutline,
      createOutline,
      cloudUploadOutline,
      paperPlaneOutline,
      folderOpenOutline,
      documentTextOutline,
      informationCircleOutline,
      shieldCheckmarkOutline,
    });
  }
}