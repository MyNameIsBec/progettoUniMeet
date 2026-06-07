import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
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
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../core/services/auth';
import { DocenteService } from '../../../core/services/docente';
import { ErroriService } from '../../../core/services/errori';@Component({  selector: 'app-gestione-slot',  templateUrl: './gestione-slot.page.html',  styleUrls: ['./gestione-slot.page.scss'],  standalone: true,    imports: [
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
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    DashboardLayoutComponent
  ]})export class GestioneSlotPage implements OnInit, AfterViewInit {  @ViewChild('mapContainer') mapContainer!: ElementRef;  private map: L.Map | null = null;  private marker: L.Marker | null = null;  private defaultLat = 38.1157;  private defaultLng = 13.3615;  docente: any = null;  slots: any[] = [];  filteredSlots: any[] = [];  slotAttiviCount = 0;  disponibiliCount = 0;  pieniCount = 0;  annullatiCount = 0;  searchTerm = '';  filtroStato = 'tutti';    inModifica = false;
  slotInModificaId: string | null = null;
  salvataggioInCorso = false;
  mostraModale = false;
  modaleTitolo = '';  form = {    data: '',    oraInizio: '',    oraFine: '',    nomeAula: '',    edificio: '',    piano: '',    latitudine: null as number | null,    longitudine: null as number | null  };  mediaRiempimento = 0;    constructor(
    private authService: AuthService,
    private docenteService: DocenteService,
    private erroriService: ErroriService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {  }  ngOnInit() {    this.docente = this.authService.getCurrentUser();    if (this.docente) {      this.caricaSlots();    }  }  ngAfterViewInit() {    setTimeout(() => this.inizializzaMappa(), 500);  }  private inizializzaMappa() {    if (!this.mapContainer) return;    this.map = L.map(this.mapContainer.nativeElement, {      center: [this.defaultLat, this.defaultLng],      zoom: 15,    });    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {      attribution: '&copy; OpenStreetMap contributors',    }).addTo(this.map);    this.map.on('click', (e: L.LeafletMouseEvent) => {      this.posizionaMarker(e.latlng.lat, e.latlng.lng);    });  }  private creaIconaMarker() {    return L.divIcon({      className: 'custom-marker-icon',      html: '<div style="background:#2563eb;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>',      iconSize: [32, 32],      iconAnchor: [16, 32],    });  }  private posizionaMarker(lat: number, lng: number) {    if (this.marker) {      this.marker.setLatLng([lat, lng]);    } else if (this.map) {      this.marker = L.marker([lat, lng], { draggable: true, icon: this.creaIconaMarker() }).addTo(this.map);      this.marker.on('dragend', () => {        const pos = this.marker!.getLatLng();        this.form.latitudine = pos.lat;        this.form.longitudine = pos.lng;      });    }    this.form.latitudine = lat;    this.form.longitudine = lng;  }  caricaSlots() {    this.docenteService.getSlots(this.docente.id).subscribe({      next: (data) => {        this.slots = data;        this.calcolaStatistiche();        this.applicaFiltri();      },      error: (err) => {        this.erroriService.gestoreErrori(err);      }    });  }  calcolaStatistiche() {    const oggi = new Date();    oggi.setHours(0, 0, 0, 0);    const slotsFuturi = this.slots.filter(s => new Date(s.data + 'T00:00:00') >= oggi);    this.slotAttiviCount = slotsFuturi.length;    this.disponibiliCount = slotsFuturi.filter(s => s.disponibilita).length;    this.pieniCount = slotsFuturi.filter(s => !s.disponibilita && s.prenotazioniCount > 0).length;    this.annullatiCount = slotsFuturi.filter(s => !s.disponibilita && s.prenotazioniCount === 0).length;    if (slotsFuturi.length > 0) {      const prenotati = slotsFuturi.filter(s => s.prenotazioniCount > 0).length;      this.mediaRiempimento = Math.round((prenotati / slotsFuturi.length) * 100);    } else {      this.mediaRiempimento = 0;    }  }  applicaFiltri() {    const oggi = new Date();    oggi.setHours(0, 0, 0, 0);    this.filteredSlots = this.slots.filter(s => {      const dataSlot = new Date(s.data + 'T00:00:00');      if (dataSlot < oggi) return false;      if (this.filtroStato === 'disponibile' && !s.disponibilita) return false;      if (this.filtroStato === 'parziale' && (s.disponibilita || s.prenotazioniCount === 0)) return false;      if (this.filtroStato === 'pieno' && (s.disponibilita || s.prenotazioniCount === 0)) return false;      if (this.filtroStato === 'annullato' && (s.disponibilita || s.prenotazioniCount > 0)) return false;      if (this.searchTerm.trim()) {        const term = this.searchTerm.toLowerCase();        const dataStr = this.formattazioneDataSemplice(s.data).toLowerCase();        const oraStr = `${s.oraInizio} ${s.oraFine}`.toLowerCase();        const luogoStr = s.luogo ? `${s.luogo.aula} ${s.luogo.edificio} piano ${s.luogo.piano}`.toLowerCase() : '';        return dataStr.includes(term) || oraStr.includes(term) || luogoStr.includes(term);      }      return true;    });  }  apriModaleCrea() {
    this.inModifica = false;
    this.slotInModificaId = null;
    this.modaleTitolo = 'Crea nuovo slot';
    this.form = { data: '', oraInizio: '', oraFine: '', nomeAula: '', edificio: '', piano: '', latitudine: null, longitudine: null };
    this.mostraModale = true;
    setTimeout(() => this.inizializzaMappa(), 300);
  }
  chiudiModale() {
    this.mostraModale = false;
    if (this.marker) { this.marker.remove(); this.marker = null; }
    if (this.map) { this.map.remove(); this.map = null; }
  }
  salvaSlot() {        if (!this.form.data || !this.form.oraInizio || !this.form.oraFine) {
      this.erroriService.mostraAvviso('Compila tutti i campi obbligatori (Giorno, Ora Inizio, Ora Fine)');
      return;
    }
    const giorno = new Date(this.form.data).getDay();
    if (giorno === 0 || giorno === 6) {
      this.erroriService.mostraAvviso('Non puoi creare slot di sabato o domenica');
      return;
    }    const [hInizio, mInizio] = this.form.oraInizio.split(':').map(Number);    const [hFine, mFine] = this.form.oraFine.split(':').map(Number);    const inizioMs = hInizio! * 60 + mInizio!;    const fineMs = hFine! * 60 + mFine!;    if (fineMs <= inizioMs) {      this.erroriService.mostraAvviso("L'ora di fine deve essere successiva all'ora di inizio");      return;    }    if (fineMs - inizioMs > 60) {      this.erroriService.mostraAvviso('La durata dello slot non può superare 1 ora');      return;    }    if (hInizio! < 9 || hFine! > 18 || (hFine === 18 && mFine! > 0)) {      this.erroriService.mostraAvviso('Gli slot sono consentiti solo nella fascia oraria 9:00 - 18:00');      return;    }    this.salvataggioInCorso = true;    const payload: any = {      data: this.form.data,      oraInizio: this.form.oraInizio,      oraFine: this.form.oraFine    };    if (this.form.nomeAula || this.form.edificio || this.form.piano || this.form.latitudine != null) {      payload.luogo = {        nomeAula: this.form.nomeAula || 'N/D',        edificio: this.form.edificio || 'N/D',        piano: String(this.form.piano || '0'),        ...(this.form.latitudine != null ? { latitudine: this.form.latitudine } : {}),        ...(this.form.longitudine != null ? { longitudine: this.form.longitudine } : {}),      };    }        const completa = () => {
      this.erroriService.mostraSuccesso(this.inModifica ? 'Slot aggiornato con successo!' : 'Slot creato con successo!');
      this.chiudiModale();
      this.caricaSlots();
      this.resetForm();
    };
    const fallisce = (err: any) => {
      this.salvataggioInCorso = false;
      const msg = err?.error?.errors?.[0]?.msg || err?.error?.error || err?.message || 'Errore sconosciuto';
      this.mostraErrore(msg);
    };
    if (this.inModifica && this.slotInModificaId) {
      this.docenteService.modificaSlot(this.docente.id, this.slotInModificaId, payload).subscribe({ next: completa, error: fallisce });
    } else {
      this.docenteService.creaSlot(this.docente.id, payload).subscribe({ next: completa, error: fallisce });
    }  }    attivaModifica(slot: any) {
    this.inModifica = true;
    this.slotInModificaId = slot.id;
    this.modaleTitolo = 'Modifica slot esistente';
    this.form = {
      data: slot.data,
      oraInizio: slot.oraInizio,
      oraFine: slot.oraFine,
      nomeAula: slot.luogo?.aula || '',
      edificio: slot.luogo?.edificio || '',
      piano: slot.luogo?.piano !== undefined ? String(slot.luogo.piano) : '',
      latitudine: slot.luogo?.latitudine ?? null,
      longitudine: slot.luogo?.longitudine ?? null
    };
    this.mostraModale = true;
    setTimeout(() => {
      this.inizializzaMappa();
      if (slot.luogo?.latitudine != null && slot.luogo?.longitudine != null) {
        this.posizionaMarker(slot.luogo.latitudine, slot.luogo.longitudine);
      }
    }, 300);
  }  async confermaEliminaSlot(slotId: string) {    const alert = await this.alertCtrl.create({      header: 'Elimina Slot',      message: 'Sei sicuro di voler eliminare questo slot di ricevimento? L\'azione è irreversibile e cancellerà eventuali prenotazioni collegate.',      buttons: [        { text: 'Annulla', role: 'cancel' },        {          text: 'Elimina',          role: 'destructive',          handler: () => {            this.eseguiEliminazione(slotId);          }        }      ]    });    await alert.present();  }  eseguiEliminazione(slotId: string) {    this.docenteService.eliminaSlot(this.docente.id, slotId).subscribe({      next: () => {        this.erroriService.mostraSuccesso('Slot eliminato con successo!');        this.caricaSlots();      },      error: (err) => {        this.erroriService.gestoreErrori(err);      }    });  }  private async mostraErrore(msg: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 4000, color: 'danger' });
    await toast.present();
  }
  resetForm() {    this.inModifica = false;    this.slotInModificaId = null;    this.salvataggioInCorso = false;    this.form = {      data: '',      oraInizio: '',      oraFine: '',      nomeAula: '',      edificio: '',      piano: '',      latitudine: null,      longitudine: null    };    if (this.marker) {      this.marker.remove();      this.marker = null;    }  }  formattazioneDataMese(dataStr: string): string {    if (!dataStr) return '';    const date = new Date(dataStr);    const mesi = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];    return mesi[date.getMonth()] || '';  }  formattazioneDataGiorno(dataStr: string): string {    if (!dataStr) return '';    const date = new Date(dataStr);    return String(date.getDate());  }  formattazioneDataAnno(dataStr: string): string {    if (!dataStr) return '';    const date = new Date(dataStr);    return String(date.getFullYear());  }  formattazioneDataSemplice(dataStr: string): string {    if (!dataStr) return '';    const parts = dataStr.split('-');    if (parts.length === 3) {      return `${parts[2]}/${parts[1]}/${parts[0]}`;    }    return dataStr;  }}
