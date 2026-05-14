import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
import { AuthService } from '../../core/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonIcon]
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Input() vociMenuMobile: VoceMenuNavigazione[] = [];

  nomeUtente: string = '';
  ruoloUtente: string = 'studente';
  menuAperto = false;
  
  private userSub: Subscription | null = null;

  constructor(private auth: AuthService) {
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

  ngOnInit() {
    // Sincronizzazione reattiva del nome utente e del ruolo direttamente dal servizio
    this.userSub = this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.nomeUtente = `${user.nome} ${user.cognome}`;
        this.ruoloUtente = user.role;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  toggleMenu() {
    this.menuAperto = !this.menuAperto;
  }

  chiudiMenu() {
    this.menuAperto = false;
  }
}
