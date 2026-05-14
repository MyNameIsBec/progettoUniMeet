import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonItem, IonSelect, IonSelectOption, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput, IonTextarea, IonSpinner, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonFooter } from '@ionic/angular/standalone';
import { DocenteService } from '../../../core/services/docente';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { AuthService } from '../../../core/services/auth';
import { Docente, SlotRicevimento } from '../../../core/models/interfacce';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AdminService, GiornoBloccato } from '../../../core/services/admin';

@Component({
  selector: 'app-prenota',
  templateUrl: './prenota.page.html',
  styleUrls: ['./prenota.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonItem, IonSelect, IonSelectOption, IonButton, IonIcon, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonInput, IonTextarea, IonSpinner, IonModal, IonHeader, IonToolbar, IonButtons, IonContent, DashboardLayoutComponent]
})
export class PrenotaPage implements OnInit {

  dataSelezionata: string = new Date().toISOString().split('T')[0];
  dataInizioSettimana: Date = new Date();
  giorniSettimana: Date[] = [];
  filtriRicerca = { docenteId: '' };
  elencoDocenti: Docente[] = [];
  tuttiGliSlot: SlotRicevimento[] = [];
  docenteSelezionato: Docente | null = null;
  slotSelezionato: SlotRicevimento | null = null;
  giorniBloccati: GiornoBloccato[] = [];
  prenotazioneForm = {
    tipologia: 'chiarimenti',
    descrizione: ''
  };
  inCaricamento = false;
  isBookingInProgress = false;
  fileSelezionati: File[] = [];
  mostraModalePrenotazione = false;

  constructor(private docenteService: DocenteService, private prenotazioneService: PrenotazioneService, private authService: AuthService, private adminService: AdminService, private router: Router) { }

  async ngOnInit() {
    this.impostaSettimanaCorrente();
    await this.caricaDocenti();
    this.caricaGiorniBloccati();
  }

  chiudiModale() {
    this.mostraModalePrenotazione = false;
    this.slotSelezionato = null;
  }

  impostaSettimanaCorrente() {
    const oggi = new Date();
    const giorno = oggi.getDay();
    const diff = oggi.getDate() - (giorno === 0 ? 6 : giorno - 1);
    this.dataInizioSettimana = new Date(oggi.setDate(diff));
    this.calcolaGiorniSettimana();
  }

  calcolaGiorniSettimana() {
    this.giorniSettimana = [];
    const temp = new Date(this.dataInizioSettimana);
    for (let i = 0; i < 7; i++) {
      this.giorniSettimana.push(new Date(temp));
      temp.setDate(temp.getDate() + 1);
    }
  }

  prossimaSettimana() {
    this.dataInizioSettimana.setDate(this.dataInizioSettimana.getDate() + 7);
    this.calcolaGiorniSettimana();
  }

  settimanaPrecedente() {
    this.dataInizioSettimana.setDate(this.dataInizioSettimana.getDate() - 7);
    this.calcolaGiorniSettimana();
  }

  formatoSettimana(): string {
    const fine = new Date(this.giorniSettimana[5]);
    const opzioni: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return `${this.giorniSettimana[0].toLocaleDateString('it-IT', opzioni)} - ${fine.toLocaleDateString('it-IT', opzioni)} ${fine.getFullYear()}`;
  }

  async caricaDocenti() {
    this.inCaricamento = true;
    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.docenteService.getDocentiPerCorso(user.role === 'studente' ? (user as any).corsoDiStudi : '').subscribe({
          next: (docenti) => {
            this.elencoDocenti = docenti;
            this.inCaricamento = false;
          },
          error: () => {
            this.inCaricamento = false;
          }
        });
      }
    } catch (error) {
      console.error('Errore caricamento docenti', error);
      this.inCaricamento = false;
    }
  }

  caricaGiorniBloccati() {
    this.adminService.getGiorniBloccati().subscribe({
      next: (giorni: any) => this.giorniBloccati = giorni,
      error: (err: any) => console.error('Errore caricamento giorni bloccati:', err)
    });
  }

  isGiornoBloccato(giorno: Date): boolean {
    if (!giorno) return false;
    const dataStr = giorno.toISOString().split('T')[0];
    return this.giorniBloccati.some(b => {
      const bDate = b.data.split('T')[0];
      return bDate === dataStr;
    });
  }

  onDocenteChange(evento: any) {
    const id = evento.detail.value;
    this.docenteSelezionato = this.elencoDocenti.find(d => String(d.id) === String(id)) || null;
    this.filtriRicerca.docenteId = id;
    this.slotSelezionato = null;

    if (this.docenteSelezionato) {
      this.caricaSlots(id);
    } else {
      this.tuttiGliSlot = [];
    }
  }

  caricaSlots(idDocente: string) {
    this.inCaricamento = true;
    this.docenteService.getSlots(idDocente).subscribe({
      next: (slots) => {
        this.tuttiGliSlot = slots.map(s => ({ ...s, data: new Date(s.data) }));
        this.inCaricamento = false;
      },
      error: (err) => {
        console.error('Errore caricamento slot', err);
        this.inCaricamento = false;
      }
    });
  }

  getSlotsGiorno(giorno: Date): SlotRicevimento[] {
    return this.tuttiGliSlot.filter(s =>
      s.data.toDateString() === giorno.toDateString()
    );
  }

  selezionaSlot(slot: SlotRicevimento) {
    this.slotSelezionato = slot;
    this.mostraModalePrenotazione = true;
  }

  preparaModale() {
    this.isBookingInProgress = false;
    this.fileSelezionati = [];
    this.prenotazioneForm.descrizione = '';
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.fileSelezionati.push(files[i]);
      }
    }
  }

  rimuoviFile(index: number) {
    this.fileSelezionati.splice(index, 1);
  }

  async prenota() {
    if (!this.slotSelezionato || !this.prenotazioneForm.tipologia) {
      alert('Seleziona uno slot e un argomento.');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.isBookingInProgress = true;

    // Usiamo FormData per inviare i file
    const formData = new FormData();
    formData.append('matricolaStudente', user.id);
    formData.append('idSlot', this.slotSelezionato.id.toString());
    formData.append('argomento', this.prenotazioneForm.tipologia);
    formData.append('descrizione', this.prenotazioneForm.descrizione || '');

    // Aggiungiamo i file selezionati
    this.fileSelezionati.forEach((file, index) => {
      formData.append('files', file); // 'files' è il nome del campo che il backend si aspetta
    });

    this.prenotazioneService.createPrenotazione(formData).subscribe({
      next: () => {
        this.isBookingInProgress = false;
        alert('Prenotazione effettuata con successo!');
        this.chiudiModale();
      },
      error: (err) => {
        console.error('Errore prenotazione', err);
        this.isBookingInProgress = false;
        alert('Errore durante la prenotazione: ' + (err.error?.error || 'Riprova più tardi.'));
      }
    });
  }

  ottieniNomeDocente(id: string | number): string {
    const docente = this.elencoDocenti.find(d => String(d.id) === String(id));
    return docente ? `${docente.nome} ${docente.cognome}` : 'Docente';
  }

  isOggi(giorno: Date): boolean {
    return giorno.toDateString() === new Date().toDateString();
  }

  getSlotsGiornoEOra(giorno: Date, ora: number): SlotRicevimento[] {
    return this.getSlotsGiorno(giorno).filter(s => {
      const oraSlot = parseInt(s.oraInizio.split(':')[0]);
      return oraSlot === ora;
    });
  }

  quandoDataSelezionata(evento: any) {
    const val = evento.detail.value;
    if (val) {
      this.dataSelezionata = val.split('T')[0];
      const d = new Date(this.dataSelezionata);
      const giorno = d.getDay();
      const diff = d.getDate() - (giorno === 0 ? 6 : giorno - 1);
      this.dataInizioSettimana = new Date(d.setDate(diff));
      this.calcolaGiorniSettimana();
    }
  }

}

