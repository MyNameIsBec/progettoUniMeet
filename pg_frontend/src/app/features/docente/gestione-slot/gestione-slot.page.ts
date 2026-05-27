import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  AlertController
} from '@ionic/angular/standalone';

import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../core/services/auth';
import { DocenteService } from '../../../core/services/docente';
import { ErroriService } from '../../../core/services/errori';

import { addIcons } from 'ionicons';
import {
  calendarClearOutline,
  calendarNumberOutline,
  addCircleOutline,
  checkmarkCircleOutline,
  peopleOutline,
  closeCircleOutline,
  createOutline,
  saveOutline,
  refreshOutline,
  listOutline,
  searchOutline,
  filterOutline,
  timeOutline,
  locationOutline,
  trashOutline,
  informationCircleOutline,
  pieChartOutline,
  alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-gestione-slot',
  templateUrl: './gestione-slot.page.html',
  styleUrls: ['./gestione-slot.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    DashboardLayoutComponent
  ]
})
export class GestioneSlotPage implements OnInit {
  docente: any = null;
  slots: any[] = [];
  filteredSlots: any[] = [];
  slotAttiviCount = 0;
  disponibiliCount = 0;
  pieniCount = 0;
  annullatiCount = 0;
  searchTerm = '';
  filtroStato = 'tutti';
  inModifica = false;
  slotInModificaId: string | null = null;
  salvataggioInCorso = false;
  form = {
    data: '',
    oraInizio: '',
    oraFine: '',
    nomeAula: '',
    edificio: '',
    piano: ''
  };
  mediaRiempimento = 0;

  constructor(
    private authService: AuthService,
    private docenteService: DocenteService,
    private erroriService: ErroriService,
    private alertCtrl: AlertController
  ) {
    addIcons({
      calendarClearOutline,
      calendarNumberOutline,
      addCircleOutline,
      checkmarkCircleOutline,
      peopleOutline,
      closeCircleOutline,
      createOutline,
      saveOutline,
      refreshOutline,
      listOutline,
      searchOutline,
      filterOutline,
      timeOutline,
      locationOutline,
      trashOutline,
      informationCircleOutline,
      pieChartOutline,
      alertCircleOutline
    });
  }

  ngOnInit() {
    this.docente = this.authService.getCurrentUser();
    if (this.docente) {
      this.caricaSlots();
    }
  }

  caricaSlots() {
    this.docenteService.getSlots(this.docente.id).subscribe({
      next: (data) => {
        this.slots = data;
        this.calcolaStatistiche();
        this.applicaFiltri();
      },
      error: (err) => {
        this.erroriService.gestoreErrori(err);
      }
    });
  }

  calcolaStatistiche() {
    this.slotAttiviCount = this.slots.length;
    this.disponibiliCount = this.slots.filter(s => s.disponibilita).length;
    this.pieniCount = this.slots.filter(s => !s.disponibilita && s.prenotazioniCount > 0).length;
    this.annullatiCount = this.slots.filter(s => !s.disponibilita && s.prenotazioniCount === 0).length;

    if (this.slots.length > 0) {
      const prenotati = this.slots.filter(s => s.prenotazioniCount > 0).length;
      this.mediaRiempimento = Math.round((prenotati / this.slots.length) * 100);
    } else {
      this.mediaRiempimento = 0;
    }
  }

  applicaFiltri() {
    this.filteredSlots = this.slots.filter(s => {
      if (this.filtroStato === 'disponibile' && !s.disponibilita) return false;
      if (this.filtroStato === 'parziale' && (s.disponibilita || s.prenotazioniCount === 0)) return false;
      if (this.filtroStato === 'pieno' && (s.disponibilita || s.prenotazioniCount === 0)) return false;
      if (this.filtroStato === 'annullato' && (s.disponibilita || s.prenotazioniCount > 0)) return false;
      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase();
        const dataStr = this.formattazioneDataSemplice(s.data).toLowerCase();
        const oraStr = `${s.oraInizio} ${s.oraFine}`.toLowerCase();
        const luogoStr = s.luogo ? `${s.luogo.aula} ${s.luogo.edificio} piano ${s.luogo.piano}`.toLowerCase() : '';

        return dataStr.includes(term) || oraStr.includes(term) || luogoStr.includes(term);
      }
      return true;
    });
  }

  salvaSlot() {
    if (!this.form.data || !this.form.oraInizio || !this.form.oraFine) {
      this.erroriService.mostraAvviso('Compila tutti i campi obbligatori (Giorno, Ora Inizio, Ora Fine)');
      return;
    }
    const [hInizio, mInizio] = this.form.oraInizio.split(':').map(Number);
    const [hFine, mFine] = this.form.oraFine.split(':').map(Number);
    const inizioMs = hInizio! * 60 + mInizio!;
    const fineMs = hFine! * 60 + mFine!;

    if (fineMs <= inizioMs) {
      this.erroriService.mostraAvviso("L'ora di fine deve essere successiva all'ora di inizio");
      return;
    }

    if (fineMs - inizioMs > 60) {
      this.erroriService.mostraAvviso('La durata dello slot non può superare 1 ora');
      return;
    }

    this.salvataggioInCorso = true;

    const payload: any = {
      data: this.form.data,
      oraInizio: this.form.oraInizio,
      oraFine: this.form.oraFine
    };

    if (this.form.nomeAula || this.form.edificio || this.form.piano) {
      payload.luogo = {
        nomeAula: this.form.nomeAula || 'N/D',
        edificio: this.form.edificio || 'N/D',
        piano: String(this.form.piano || '0')
      };
    }

    if (this.inModifica && this.slotInModificaId) {
      this.docenteService.modificaSlot(this.docente.id, this.slotInModificaId, payload).subscribe({
        next: () => {
          this.erroriService.mostraSuccesso('Slot aggiornato con successo!');
          this.caricaSlots();
          this.resetForm();
        },
        error: (err) => {
          this.salvataggioInCorso = false;
          this.erroriService.gestoreErrori(err);
        }
      });
    } else {
      this.docenteService.creaSlot(this.docente.id, payload).subscribe({
        next: () => {
          this.erroriService.mostraSuccesso('Slot creato con successo!');
          this.caricaSlots();
          this.resetForm();
        },
        error: (err) => {
          this.salvataggioInCorso = false;
          this.erroriService.gestoreErrori(err);
        }
      });
    }
  }

  attivaModifica(slot: any) {
    this.inModifica = true;
    this.slotInModificaId = slot.id;
    this.form = {
      data: slot.data,
      oraInizio: slot.oraInizio,
      oraFine: slot.oraFine,
      nomeAula: slot.luogo?.aula || '',
      edificio: slot.luogo?.edificio || '',
      piano: slot.luogo?.piano !== undefined ? String(slot.luogo.piano) : ''
    };
  }

  async confermaEliminaSlot(slotId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Elimina Slot',
      message: 'Sei sicuro di voler eliminare questo slot di ricevimento? L\'azione è irreversibile e cancellerà eventuali prenotazioni collegate.',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: () => {
            this.eseguiEliminazione(slotId);
          }
        }
      ]
    });
    await alert.present();
  }

  eseguiEliminazione(slotId: string) {
    this.docenteService.eliminaSlot(this.docente.id, slotId).subscribe({
      next: () => {
        this.erroriService.mostraSuccesso('Slot eliminato con successo!');
        this.caricaSlots();
      },
      error: (err) => {
        this.erroriService.gestoreErrori(err);
      }
    });
  }

  resetForm() {
    this.inModifica = false;
    this.slotInModificaId = null;
    this.salvataggioInCorso = false;
    this.form = {
      data: '',
      oraInizio: '',
      oraFine: '',
      nomeAula: '',
      edificio: '',
      piano: ''
    };
  }

  formattazioneDataMese(dataStr: string): string {
    if (!dataStr) return '';
    const date = new Date(dataStr);
    const mesi = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
    return mesi[date.getMonth()] || '';
  }

  formattazioneDataGiorno(dataStr: string): string {
    if (!dataStr) return '';
    const date = new Date(dataStr);
    return String(date.getDate());
  }

  formattazioneDataAnno(dataStr: string): string {
    if (!dataStr) return '';
    const date = new Date(dataStr);
    return String(date.getFullYear());
  }

  formattazioneDataSemplice(dataStr: string): string {
    if (!dataStr) return '';
    const parts = dataStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dataStr;
  }
}