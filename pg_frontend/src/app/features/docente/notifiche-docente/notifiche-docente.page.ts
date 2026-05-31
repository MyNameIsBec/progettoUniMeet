import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { NotificaService, Notifica } from '../../../core/services/notifica';
import { AuthService } from '../../../core/services/auth';
import { ErroriService } from '../../../core/services/errori';



@Component({
  selector: 'app-notifiche-docente',
  templateUrl: './notifiche-docente.page.html',
  styleUrls: ['./notifiche-docente.page.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, DashboardLayoutComponent]
})

export class NotificheDocentePage implements OnInit {
  docenteId: string = '';
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
    private authService: AuthService,
    private erroriService: ErroriService,
    private alertCtrl: AlertController,
  ) {
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if(!user?.id) return;
    this.docenteId = user.id;
 
    this.caricaNotifiche();
  }

  caricaNotifiche() {
    this.notificaService.getNotifiche(this.docenteId).subscribe({
      next: (data) => {
        this.notifiche = data;
        this.applicaFiltri(this.filtroAttivo);
        this.aggiornaStatistiche();
      },
      error: (err) => {
        console.error('Errore nel caricamento notifiche docente', err);
        this.erroriService.gestoreErrori(err);
      }
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

  async dettagliNotifica(n: Notifica) {
    if (!n.letta) {
      this.notificaService.segnaComeLetta(n.id).subscribe(() => {
        n.letta = true;
        this.aggiornaStatistiche();
        if (this.docenteId) this.notificaService.fetchNonLette(this.docenteId);
      });
    }

    const alert = await this.alertCtrl.create({
      header: n.titolo,
      message: n.messaggio + '\n\nData: ' + new Date(n.dataInvio).toLocaleString('it-IT') + '\nTipo: ' + n.tipo,
      buttons: ['Chiudi'],
    });
    await alert.present();
  }

  segnaComeLetta(notifica: Notifica) {
    if (notifica.letta) return;
    this.notificaService.segnaComeLetta(notifica.id).subscribe(() => {
      notifica.letta = true;
      this.aggiornaStatistiche();
      if (this.docenteId) this.notificaService.fetchNonLette(this.docenteId);
    });
  }

  segnaTutteComeLette() {
    if (!this.docenteId) return;
    this.notificaService.segnaTutteComeLette(this.docenteId).subscribe(() => {
      this.notifiche.forEach(n => n.letta = true);
      this.aggiornaStatistiche();
      this.notificaService.fetchNonLette(this.docenteId);
    });
  }

  cancellaNotificheLette() {
    if (!this.docenteId) return;
    this.notificaService.cancellaNotificheLette(this.docenteId).subscribe(() => {
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
