import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonSelect,
  IonSelectOption,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';

import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../core/services/auth';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { ErroriService } from '../../../core/services/errori';

import { addIcons } from 'ionicons';
import {
  calendarOutline,
  calendarClearOutline,
  calendarNumberOutline,
  chevronForwardOutline,
  hourglassOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  searchOutline,
  filterOutline,
  timeOutline,
  locationOutline,
  chatbubbleEllipsesOutline,
  flashOutline,
  informationCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-prenotazioni-ricevute',
  templateUrl: './prenotazioni-ricevute.page.html',
  styleUrls: ['./prenotazioni-ricevute.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonSelect,
    IonSelectOption,
    DashboardLayoutComponent
  ]
})
export class PrenotazioniRicevutePage implements OnInit {
  docente: any = null;
  prenotazioni: any[] = [];
  filteredPrenotazioni: any[] = [];

  // Contatori
  totaleRicevute = 0;
  inAttesaCount = 0;
  confermateCount = 0;
  completateCount = 0;

  // Filtri
  searchTerm = '';
  filtroStato = 'tutti';
  filtroTempo = 'storico';

  loading = true;

  constructor(
    private authService: AuthService,
    private prenotazioneService: PrenotazioneService,
    private erroriService: ErroriService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      calendarOutline,
      calendarClearOutline,
      calendarNumberOutline,
      chevronForwardOutline,
      hourglassOutline,
      checkmarkCircleOutline,
      documentTextOutline,
      searchOutline,
      filterOutline,
      timeOutline,
      locationOutline,
      chatbubbleEllipsesOutline,
      flashOutline,
      informationCircleOutline
    });
  }

  ngOnInit() {
    this.docente = this.authService.getCurrentUser();
    if (this.docente) {
      this.caricaPrenotazioni();
    }
  }

  caricaPrenotazioni() {
    this.loading = true;
    this.prenotazioneService.getPrenotazioniDocente(this.docente.id).subscribe({
      next: (data) => {
        this.prenotazioni = data;
        this.calcolaStatistiche();
        this.applicaFiltri();
        this.loading = false;
      },
      error: (err) => {
        this.erroriService.gestoreErrori(err);
        this.loading = false;
      }
    });
  }

  calcolaStatistiche() {
    this.totaleRicevute = this.prenotazioni.length;
    this.inAttesaCount = this.prenotazioni.filter(p => this.checkStato(p.stato, 'in_attesa')).length;
    this.confermateCount = this.prenotazioni.filter(p => this.checkStato(p.stato, 'confermata') || this.checkStato(p.stato, 'confermato')).length;
    this.completateCount = this.prenotazioni.filter(p => this.checkStato(p.stato, 'completata')).length;
  }

  applicaFiltri() {
    this.filteredPrenotazioni = this.prenotazioni.filter(p => {
      // 1. Filtro Stato
      const statoLower = p.stato.toLowerCase();
      if (this.filtroStato === 'confermata' && statoLower !== 'confermata' && statoLower !== 'confermato') return false;
      if (this.filtroStato === 'in-attesa' && statoLower !== 'in_attesa' && statoLower !== 'in-attesa') return false;
      if (this.filtroStato === 'annullata' && statoLower !== 'annullata' && statoLower !== 'annullato') return false;
      if (this.filtroStato === 'completata' && statoLower !== 'completata') return false;

      // 2. Filtro Temporale
      if (this.filtroTempo !== 'storico') {
        const datePren = new Date(p.data);
        const oggi = new Date();
        oggi.setHours(0, 0, 0, 0);

        if (this.filtroTempo === 'oggi') {
          const dataPrenStr = datePren.toISOString().split('T')[0];
          const oggiStr = oggi.toISOString().split('T')[0];
          if (dataPrenStr !== oggiStr) return false;
        } else if (this.filtroTempo === 'settimana') {
          const diff = oggi.getTime() - datePren.getTime();
          const giorniDiff = diff / (1000 * 60 * 60 * 24);
          if (Math.abs(giorniDiff) > 7) return false;
        } else if (this.filtroTempo === 'mese') {
          if (datePren.getMonth() !== oggi.getMonth() || datePren.getFullYear() !== oggi.getFullYear()) return false;
        }
      }

      // 3. Ricerca Libera (Studente, Argomento)
      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase();
        const studenteStr = p.studente.toLowerCase();
        const argStr = p.argomento.toLowerCase();
        return studenteStr.includes(term) || argStr.includes(term);
      }

      return true;
    });
  }

  confermaPrenotazione(id: string) {
    this.prenotazioneService.aggiornaStatoPrenotazione(id, 'CONFERMATA').subscribe({
      next: () => {
        this.showToast('Prenotazione confermata con successo!', 'success');
        this.caricaPrenotazioni();
      },
      error: (err) => this.erroriService.gestoreErrori(err)
    });
  }

  async confermaAnnullaPrenotazione(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Annulla Ricevimento',
      message: 'Sei sicuro di voler annullare questo ricevimento? Lo studente riceverà una notifica automatica.',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Conferma',
          role: 'destructive',
          handler: () => {
            this.eseguiAnnullamento(id);
          }
        }
      ]
    });
    await alert.present();
  }

  eseguiAnnullamento(id: string) {
    this.prenotazioneService.aggiornaStatoPrenotazione(id, 'ANNULLATA').subscribe({
      next: () => {
        this.showToast('Ricevimento annullato.', 'warning');
        this.caricaPrenotazioni();
      },
      error: (err) => this.erroriService.gestoreErrori(err)
    });
  }

  confermaTutteInAttesa() {
    const pending = this.prenotazioni.filter(p => this.checkStato(p.stato, 'in_attesa'));
    if (pending.length === 0) {
      this.showToast('Nessuna prenotazione in attesa da confermare.', 'warning');
      return;
    }

    const requests = pending.map(p => this.prenotazioneService.aggiornaStatoPrenotazione(p.id, 'CONFERMATA'));
    forkJoin(requests).subscribe({
      next: () => {
        this.showToast(`Confermate ${pending.length} richieste in attesa!`, 'success');
        this.caricaPrenotazioni();
      },
      error: (err) => this.erroriService.gestoreErrori(err)
    });
  }

  // Agenda di oggi
  get agendaDiOggi(): any[] {
    const oggiStr = new Date().toISOString().split('T')[0];
    return this.prenotazioni.filter(p => p.data === oggiStr && (this.checkStato(p.stato, 'confermata') || this.checkStato(p.stato, 'confermato')));
  }

  // Helper per verificare lo stato tollerando variazioni di casing
  checkStato(stato: string, atteso: string): boolean {
    if (!stato) return false;
    return stato.toLowerCase() === atteso.toLowerCase();
  }

  // Genera iniziali studente
  getIniziali(nomeCognome: string): string {
    if (!nomeCognome) return '??';
    const parts = nomeCognome.split(' ');
    const iniziali = parts.map(p => p[0] || '').join('');
    return iniziali.substring(0, 2).toUpperCase();
  }

  // Colore avatar studente in base al nome per estetica dinamica
  getAvatarColor(nomeCognome: string): string {
    const colors = ['blue', 'green', 'purple', 'orange', 'red'];
    let hash = 0;
    for (let i = 0; i < nomeCognome.length; i++) {
      hash = nomeCognome.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index] || 'blue';
  }

  formattazioneData(dataStr: string): string {
    if (!dataStr) return '';
    const parts = dataStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dataStr;
  }

  async showToast(msg: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }
}