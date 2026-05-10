import { Component, AfterViewInit, ChangeDetectorRef, inject } from '@angular/core';

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
export class HomePage implements AfterViewInit {
  activeSection: string = 'home';
  private cdr = inject(ChangeDetectorRef);

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

  ngAfterViewInit() {
    const sections = document.querySelectorAll<HTMLElement>('section[id], footer[id]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeSection = entry.target.id;
          this.cdr.detectChanges();
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));
  }
}