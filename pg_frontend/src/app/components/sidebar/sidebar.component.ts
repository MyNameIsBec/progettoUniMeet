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
  personOutline,
  logOutOutline,
  settingsOutline,
  schoolOutline
} from 'ionicons/icons';

import { VoceMenuNavigazione } from '../../core/models/interfacce';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonIcon]
})
export class SidebarComponent {
  @Input() ruoloUtente: string = 'studente';
  @Input() vociMenu: VoceMenuNavigazione[] = [];

  constructor() {
    addIcons({
      calendarOutline,
      homeOutline,
      peopleOutline,
      calendarClearOutline,
      calendarNumberOutline,
      helpCircleOutline,
      personOutline,
      logOutOutline,
      settingsOutline,
      schoolOutline
    });
  }
}
