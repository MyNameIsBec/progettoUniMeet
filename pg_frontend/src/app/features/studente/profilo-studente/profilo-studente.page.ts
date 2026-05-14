import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  IonToggle,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  calendarClearOutline,
  calendarNumberOutline,
  calendarOutline,
  checkmarkCircleOutline,
  chevronDownOutline,
  helpCircleOutline,
  homeOutline,
  idCardOutline,
  keyOutline,
  lockClosedOutline,
  logOutOutline,
  notificationsOutline,
  peopleOutline,
  personCircleOutline,
  personOutline,
  refreshOutline,
  saveOutline,
  statsChartOutline,
  timeOutline,
  moonOutline,
  sunnyOutline
} from 'ionicons/icons';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-profilo-studente',
  standalone: true,
  imports: [
    CommonModule,
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
    IonToggle,
    RouterLink,
    DashboardLayoutComponent,
  ],
  templateUrl: './profilo-studente.page.html',
  styleUrls: ['./profilo-studente.page.scss'],
})
export class ProfiloStudentePage {
  isDarkMode = false;

  constructor() {
    // Check current theme
    this.isDarkMode = document.body.classList.contains('dark');

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
      idCardOutline,
      personCircleOutline,
      lockClosedOutline,
      keyOutline,
      checkmarkCircleOutline,
      timeOutline,
      statsChartOutline,
      saveOutline,
      refreshOutline,
      moonOutline,
      sunnyOutline
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
    // Optional: save to local storage
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }
}