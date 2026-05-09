import { Component } from '@angular/core';

import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSegment,
  IonSegmentButton,
  IonCheckbox
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  calendarOutline,
  calendarClearOutline,
  calendarNumberOutline,
  logInOutline,
  personAddOutline,
  personOutline,
  peopleOutline,
  schoolOutline,
  createOutline,
  notificationsOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  folderOutline,
  timeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonInput,
    IonSegment,
    IonSegmentButton,
    IonCheckbox
]
})
export class HomePage {
  constructor() {
    addIcons({
      calendarOutline,
      calendarClearOutline,
      calendarNumberOutline,
      logInOutline,
      personAddOutline,
      personOutline,
      peopleOutline,
      schoolOutline,
      createOutline,
      notificationsOutline,
      documentTextOutline,
      checkmarkCircleOutline,
      folderOutline,
      timeOutline
    });
  }
}