import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton } from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { NotificaService, Notifica } from '../../../core/services/notifica';
import { AuthService } from '../../../core/services/auth';

import { addIcons } from 'ionicons';
import {
  mailOutline,
  mailUnreadOutline,
  timeOutline,
  megaphoneOutline,
  notificationsOffOutline,
  chevronForwardOutline,
  mailOpenOutline,
  trashOutline,
  informationCircleOutline,
  notificationsOutline,
  checkmarkCircleOutline,
  documentTextOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-notifiche-docente',
  templateUrl: './notifiche-docente.page.html',
  styleUrls: ['./notifiche-docente.page.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, DashboardLayoutComponent]
})

export class NotificheDocentePage implements OnInit {
  notifiche: Notifica[] = [];
  filtriNotifiche: Notifica[] = [];
  filtroAttivo: string = 'Tutte';

  info = {
    nonLette: 0,
    promemoria: 0,
    aggiornamenti: 0
  };

  constructor(
    private notificaService: NotificaService,
    private authService: AuthService
  ) {
    addIcons({
      mailOutline,
      mailUnreadOutline,
      timeOutline,
      megaphoneOutline,
      notificationsOffOutline,
      chevronForwardOutline,
      mailOpenOutline,
      trashOutline,
      informationCircleOutline,
      notificationsOutline,
      checkmarkCircleOutline,
      documentTextOutline
    });
  }

  ngOnInit() {
    this.caricaNotifiche();
  }

  caricaNotifiche() {
    const user = this.authService.getCurrentUser();
    let docenteId = "";
    if (user != null) {
      docenteId = user.id;
    } else {
      return
    }

    this.notificaService.getNotifiche(docenteId).subscribe({
      next: (data) => {
        this.notifiche = data;
        this.applicaFiltri(this.filtroAttivo);
        this.aggiornaStatistiche();
      },
      error: (err) => console.error('Errore nel caricamento notifiche docente', err)
    });
  }

  aggiornaStatistiche() {
    this.info.nonLette = this.notifiche.filter(n => !n.letta).length;
    this.info.promemoria = this.notifiche.filter(n => n.tipo === 'PROMEMORIA').length;
    this.info.aggiornamenti = this.notifiche.filter(n => n.tipo === 'MODIFICA' || n.tipo === 'SISTEMA').length;
  }

  applicaFiltri(filter: string) {
    this.filtroAttivo = filter;
    switch (filter) {
      case 'Non lette':
        this.filtriNotifiche = this.notifiche.filter(n => !n.letta);
        break;
      case 'Promemoria':
        this.filtriNotifiche = this.notifiche.filter(n => n.tipo === 'PROMEMORIA');
        break;
      case 'Aggiornamenti':
        this.filtriNotifiche = this.notifiche.filter(n => n.tipo === 'MODIFICA' || n.tipo === 'SISTEMA');
        break;
      default:
        this.filtriNotifiche = this.notifiche;
        break;
    }
  }

  segnaComeLetta(notifica: Notifica) {
    if (notifica.letta) return;

    this.notificaService.segnaComeLetta(notifica.id).subscribe(() => {
      notifica.letta = true;
      this.aggiornaStatistiche();
    });
  }

  segnaTutteComeLette() {
    const user = this.authService.getCurrentUser();
    let docenteId = "";
    if (user != null) {
      docenteId = user.id;
    } else {
      return
    }
    if (!docenteId) return;

    this.notificaService.segnaTutteComeLette(docenteId).subscribe(() => {
      this.notifiche.forEach(n => n.letta = true);
      this.aggiornaStatistiche();
    });
  }

  cancellaNotificheLette() {
    const user = this.authService.getCurrentUser();
    let docenteId = "";
    if (user != null) {
      docenteId = user.id;
    } else {
      return
    }
    if (!docenteId) return;

    this.notificaService.cancellaNotificheLette(docenteId).subscribe(() => {
      this.notifiche = this.notifiche.filter(n => !n.letta);
      this.applicaFiltri(this.filtroAttivo);
      this.aggiornaStatistiche();
    });
  }

  getIconColor(tipo: string): string {
    switch (tipo) {
      case 'PROMEMORIA': return 'blue';
      case 'CONFERMA': return 'green';
      case 'MODIFICA': return 'orange';
      default: return 'blue';
    }
  }

  getIconName(tipo: string): string {
    switch (tipo) {
      case 'PROMEMORIA': return 'notifications-outline';
      case 'CONFERMA': return 'checkmark-circle-outline';
      case 'MODIFICA': return 'time-outline';
      case 'SISTEMA': return 'document-text-outline';
      default: return 'notifications-outline';
    }
  }
}
