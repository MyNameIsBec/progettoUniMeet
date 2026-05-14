import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  homeOutline,
  peopleOutline,
  calendarClearOutline,
  calendarNumberOutline,
  helpCircleOutline,
  notificationsOutline,
  personOutline,
  chevronDownOutline,
  menuOutline,
  closeOutline,
  logOutOutline,
  alertCircleOutline,
  calendar
} from 'ionicons/icons';
import { VoceMenuNavigazione } from '../../core/models/interfacce';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonIcon]
})
export class TopbarComponent {
  @Input() ruoloUtente: string = 'studente';
  @Input() nomeUtente: string = 'Alessio Lombardo';
  @Input() vociMenuMobile: VoceMenuNavigazione[] = [];

  menuAperto = false;

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
      chevronDownOutline,
      menuOutline,
      closeOutline,
      logOutOutline,
      alertCircleOutline,
      calendar
    });
  }

  toggleMenu() {
    this.menuAperto = !this.menuAperto;
  }

  chiudiMenu() {
    this.menuAperto = false;
  }
}
