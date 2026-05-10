import { Component, ViewChild } from '@angular/core';

import { IonHeader, IonToolbar, IonContent, IonButton, IonIcon, IonCard, IonCardContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, logInOutline, schoolOutline, calendarClearOutline, 
  createOutline, notificationsOutline, documentTextOutline, personOutline, 
  calendarNumberOutline, peopleOutline, checkmarkCircleOutline, folderOutline, timeOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonContent, IonButton, IonIcon, IonCard, IonCardContent, IonGrid, IonRow, IonCol]
})
export class HomePage {
  @ViewChild(IonContent, { static: true }) content?: IonContent;

  activeSection: string = 'home';

  constructor() {
    addIcons({
      calendarOutline, logInOutline, schoolOutline, calendarClearOutline,
      createOutline, notificationsOutline, documentTextOutline, personOutline,
      calendarNumberOutline, peopleOutline, checkmarkCircleOutline, folderOutline, timeOutline
    });
  }

  async scrollToSection(event: Event, sectionId: string) {
    event.preventDefault();
    this.activeSection = sectionId;

    const section = document.getElementById(sectionId);
    if (!section || !this.content) {
      return;
    }

    const top = section.offsetTop - 80;
    await this.content.scrollToPoint(0, top > 0 ? top : 0, 400);
  }
}