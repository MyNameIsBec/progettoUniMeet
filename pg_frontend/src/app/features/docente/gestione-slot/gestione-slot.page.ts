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
  IonItem,
  IonInput,
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
  statsChartOutline,
  addCircleOutline,
  checkmarkCircleOutline,
  peopleOutline,
  closeCircleOutline,
  createOutline,
  saveOutline,
  refreshOutline,
  listOutline,
  searchOutline,
  filterOutline,
  timeOutline,
  hourglassOutline,
  locationOutline,
  trashOutline,
  informationCircleOutline,
  pieChartOutline,
  alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-gestione-slot',
  templateUrl: './gestione-slot.page.html',
  styleUrls: ['./gestione-slot.page.scss'],
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
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption
  ]
})
export class GestioneSlotPage {
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
      checkmarkCircleOutline,
      peopleOutline,
      closeCircleOutline,
      createOutline,
      saveOutline,
      refreshOutline,
      listOutline,
      searchOutline,
      filterOutline,
      timeOutline,
      hourglassOutline,
      locationOutline,
      trashOutline,
      informationCircleOutline,
      pieChartOutline,
      alertCircleOutline
    });
  }
}