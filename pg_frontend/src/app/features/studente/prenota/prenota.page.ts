import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonItem, IonSelect, IonSelectOption, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput, IonTextarea, IonSpinner, IonModal } from '@ionic/angular/standalone';
import { DocenteService } from '../../../core/services/docente';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { AuthService } from '../../../core/services/auth';
import { Docente, SlotRicevimento } from '../../../core/models/interfacce';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AdminService, GiornoBloccato } from '../../../core/services/admin';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-prenota',
  templateUrl: './prenota.page.html',
  styleUrls: ['./prenota.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonItem, IonSelect, IonSelectOption, IonButton, IonIcon, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonInput, IonTextarea, IonSpinner, IonModal, DashboardLayoutComponent]
})
export class PrenotaPage implements OnInit {

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

  constructor(
    private docenteService: DocenteService,
    private prenotazioneService: PrenotazioneService,
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.impostaSettimanaCorrente();
    this.caricaGiorniBloccati();
    await this.caricaDocenti();

    // Gestione parametro query per pre-selezionare il docente
    this.route.queryParams.subscribe(params => {
      const docenteId = params['docenteId'];
      if (docenteId) {
        this.filtriRicerca.docenteId = docenteId;
        this.selezionaDocente(docenteId);
      }
    });
  }

  private selezionaDocente(id: string) {
    // Cerchiamo il docente nell'elenco già caricato
    const docente = this.elencoDocenti.find(d => String(d.id) === String(id));
    if (docente) {
      this.docenteSelezionato = docente;
      this.caricaSlots(id);
    }
  }

  chiudiModale() {
    this.mostraModalePrenotazione = false;
    this.slotSelezionato = null;
  }

  impostaSettimanaCorrente() {
    this.dataInizioSettimana = new Date();
    this.dataInizioSettimana.setHours(0, 0, 0, 0);
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
    // Non permettiamo di andare prima di oggi
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const nuovaData = new Date(this.dataInizioSettimana);
    nuovaData.setDate(nuovaData.getDate() - 7);
    
    if (nuovaData >= oggi) {
      this.dataInizioSettimana = nuovaData;
      this.calcolaGiorniSettimana();
    }
  }

  formatoSettimana(): string {
    const fine = new Date(this.giorniSettimana[6]);
    const opzioni: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return `${this.giorniSettimana[0].toLocaleDateString('it-IT', opzioni)} - ${fine.toLocaleDateString('it-IT', opzioni)} ${fine.getFullYear()}`;
  }

  async caricaDocenti() {
    this.inCaricamento = true;
    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        // Carichiamo tutti i docenti o quelli del corso
        const docenti = await firstValueFrom(this.docenteService.getDocentiPerCorso(user.role === 'studente' ? (user as any).corsoDiStudi : ''));
        this.elencoDocenti = docenti;
        
        // Se c'era un ID in sospeso dalla query string, lo attiviamo ora
        if (this.filtriRicerca.docenteId) {
          this.selezionaDocente(this.filtriRicerca.docenteId);
        }
      }
    } catch (error) {
      console.error('Errore caricamento docenti', error);
    } finally {
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
    return this.giorniBloccati.some(b => b.data.split('T')[0] === dataStr);
  }

  onDocenteChange(evento: any) {
    const id = evento.detail.value;
    this.filtriRicerca.docenteId = id;
    this.selezionaDocente(id);
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
    const oggi = new Date();
    return this.tuttiGliSlot.filter(s => {
      const dataSlot = new Date(s.data);
      // Filtra slot passati (giorni precedenti)
      if (dataSlot < oggi && dataSlot.toDateString() !== oggi.toDateString()) return false;
      
      // Filtra slot passati (stesso giorno ma ora passata)
      if (dataSlot.toDateString() === oggi.toDateString()) {
        const [ore, minuti] = s.oraInizio.split(':').map(Number);
        const oraAttuale = new Date();
        if (ore < oraAttuale.getHours() || (ore === oraAttuale.getHours() && minuti < oraAttuale.getMinutes())) {
          return false;
        }
      }
      return dataSlot.toDateString() === giorno.toDateString();
    });
  }

  selezionaSlot(slot: SlotRicevimento) {
    this.slotSelezionato = slot;
    this.mostraModalePrenotazione = true;
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
    const formData = new FormData();
    formData.append('matricolaStudente', user.id);
    formData.append('idSlot', this.slotSelezionato.id.toString());
    formData.append('argomento', this.prenotazioneForm.tipologia);
    formData.append('descrizione', this.prenotazioneForm.descrizione || '');

    this.fileSelezionati.forEach(file => formData.append('files', file));

    this.prenotazioneService.createPrenotazione(formData).subscribe({
      next: () => {
        this.isBookingInProgress = false;
        alert('Prenotazione effettuata con successo!');
        this.chiudiModale();
        this.caricaSlots(String(this.filtriRicerca.docenteId)); // Ricarica per mostrare lo slot come occupato
      },
      error: (err) => {
        console.error('Errore prenotazione', err);
        this.isBookingInProgress = false;
        alert('Errore durante la prenotazione: ' + (err.error?.error || 'Riprova più tardi.'));
      }
    });
  }

  isOggi(giorno: Date): boolean {
    return giorno.toDateString() === new Date().toDateString();
  }

  getSlotGiornoEOra(giorno: Date, ora: number): SlotRicevimento | null {
    return this.getSlotsGiorno(giorno).find(s => {
      const oraSlot = parseInt(s.oraInizio.split(':')[0]);
      return oraSlot === ora;
    }) || null;
  }

  quandoDataSelezionata(evento: any) {
    const val = evento.detail.value;
    if (val) {
      const d = new Date(val);
      this.dataInizioSettimana = new Date(d);
      this.dataInizioSettimana.setHours(0, 0, 0, 0);
      this.calcolaGiorniSettimana();
    }
  }
}
