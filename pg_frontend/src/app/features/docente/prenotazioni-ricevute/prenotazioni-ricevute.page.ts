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
  AlertController
} from '@ionic/angular/standalone';

import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../core/services/auth';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { ErroriService } from '../../../core/services/errori';
import { exportAgendaPDF } from './pdf-generator';



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
  totaleRicevute = 0;
  inAttesaCount = 0;
  confermateCount = 0;
  completateCount = 0;
  searchTerm = '';
  filtroStato = 'tutti';
  filtroTempo = 'oggi';
  loading = true;

  constructor(
    private authService: AuthService,
    private prenotazioneService: PrenotazioneService,
    private erroriService: ErroriService,
    private alertCtrl: AlertController
  ) {
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
    this.inAttesaCount = this.prenotazioni.filter(p => p.stato === 'in_attesa').length;
    this.confermateCount = this.prenotazioni.filter(p => p.stato === 'confermata').length;
    this.completateCount = this.prenotazioni.filter(p => p.stato === 'completata').length;
  }

  applicaFiltri() {
    this.filteredPrenotazioni = this.prenotazioni.filter(p => {
      const statoLower = p.stato.toLowerCase();
      if (this.filtroStato !== 'tutti' && statoLower !== this.filtroStato) return false;
      if (this.filtroTempo !== 'storico') {
        const [y, m, d] = p.data.split('-').map(Number);
        const datePren = new Date(y, m - 1, d);
        const oggi = new Date();
        oggi.setHours(0, 0, 0, 0);
        if (this.filtroTempo === 'oggi') {
          const oggiStr = this.getLocalOggiStr();
          if (p.data !== oggiStr) return false;
        } else if (this.filtroTempo === 'settimana') {
          const diff = oggi.getTime() - datePren.getTime();
          const giorniDiff = diff / (1000 * 60 * 60 * 24);
          if (Math.abs(giorniDiff) > 7) return false;
        } else if (this.filtroTempo === 'mese') {
          if (datePren.getMonth() !== oggi.getMonth() || datePren.getFullYear() !== oggi.getFullYear()) return false;
        }
      }
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
        this.erroriService.mostraSuccesso('Prenotazione confermata con successo!');
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
        this.erroriService.mostraAvviso('Ricevimento annullato.');
        this.caricaPrenotazioni();
      },
      error: (err) => this.erroriService.gestoreErrori(err)
    });
  }

  confermaTutteInAttesa() {
    const pending = this.prenotazioni.filter(p => p.stato === 'in_attesa');
    if (pending.length === 0) {
      this.erroriService.mostraAvviso('Nessuna prenotazione in attesa da confermare.');
      return;
    }

    const requests = pending.map(p => this.prenotazioneService.aggiornaStatoPrenotazione(p.id, 'CONFERMATA'));
    forkJoin(requests).subscribe({
      next: () => {
        this.erroriService.mostraSuccesso(`Confermate ${pending.length} richieste in attesa!`);
        this.caricaPrenotazioni();
      },
      error: (err) => this.erroriService.gestoreErrori(err)
    });
  }

  getLocalOggiStr(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get agendaDiOggi(): any[] {
    const oggiStr = this.getLocalOggiStr();
    return this.prenotazioni.filter(p => p.data === oggiStr && p.stato !== 'annullata');
  }

  scaricaAgendaPDF() {
    const agenda = this.agendaDiOggi;
    if (agenda.length === 0) {
      this.erroriService.mostraAvviso('Nessuna prenotazione presente per oggi.');
      return;
    }

    const success = exportAgendaPDF(this.docente, agenda, this.getLocalOggiStr());
    if (!success) {
      this.erroriService.gestoreErrori({ status: 0 } as any);
    }
  }

  checkStato(stato: string, atteso: string): boolean {
    if (!stato) return false;
    return stato.toLowerCase() === atteso.toLowerCase();
  }

  getIniziali(nomeCognome: string): string {
    if (!nomeCognome) return '??';
    const parts = nomeCognome.split(' ');
    const iniziali = parts.map(p => p[0] || '').join('');
    return iniziali.substring(0, 2).toUpperCase();
  }

  getAvatarColor(nomeCognome: string): string {
  const colors = ['blue', 'green', 'purple', 'orange', 'red'];
  let somma = 0;
  for (const lettera of nomeCognome) {
    somma += lettera.charCodeAt(0);
  }
  const index = somma % colors.length;
  return colors[index];
}

  formattazioneData(dataStr: string): string {
    if (!dataStr) return '';
    const parts = dataStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dataStr;
  }

}