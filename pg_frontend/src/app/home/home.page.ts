import { Component } from '@angular/core';

import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  calendarOutline,
  calendarClearOutline,
  informationCircleOutline,
  personOutline,
  bookOutline,
  timeOutline,
  businessOutline,
  schoolOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea
  ]
})
export class HomePage {
  constructor() {
    addIcons({
      calendarOutline,
      calendarClearOutline,
      informationCircleOutline,
      personOutline,
      bookOutline,
      timeOutline,
      businessOutline,
      schoolOutline,
      shieldCheckmarkOutline
    });
  }
}