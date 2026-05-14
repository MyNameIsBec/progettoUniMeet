import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton } from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { NotificaService, Notifica } from '../../../core/services/notifica';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-notifiche',
  templateUrl: './notifiche.page.html',
  styleUrls: ['./notifiche.page.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, DashboardLayoutComponent]
})

export class NotifichePage implements OnInit {
  notifiche: Notifica[] = [];
  filtriNotifiche: Notifica[] = [];
  filtroAttivo: string = 'Tutte';

  info = {
    nonLette: 0,
    promemoria: 0,
    aggiornamenti: 0
  };

  constructor(private notificaService: NotificaService, private authService: AuthService) { }

  ngOnInit() {
    this.caricaNotifiche();
  }

  caricaNotifiche() {
    const user = this.authService.getCurrentUser();
    let matricola = "";
    if (user != null) {
      matricola = user.id;
    } else {
      return
    }

    this.notificaService.getNotifiche(matricola).subscribe({
      next: (data) => {
        this.notifiche = data;
        this.applicaFiltri(this.filtroAttivo);
        this.aggiornaStatistiche();
      },
      error: (err) => console.error('Errore nel caricamento notifiche', err)
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
    let matricola = "";
    if (user != null) {
      matricola = user.id;
    } else {
      return
    }
    if (!matricola) return;

    this.notificaService.segnaTutteComeLette(matricola).subscribe(() => {
      this.notifiche.forEach(n => n.letta = true);
      this.aggiornaStatistiche();
    });
  }

  cancellaNotificheLette() {
    const user = this.authService.getCurrentUser();
    let matricola = "";
    if (user != null) {
      matricola = user.id;
    } else {
      return
    }
    if (!matricola) return;

    this.notificaService.cancellaNotificheLette(matricola).subscribe(() => {
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