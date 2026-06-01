import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import * as L from 'leaflet';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonTextarea } from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { AuthService } from '../../../core/services/auth';
import { Prenotazione } from '../../../core/models/interfacce';

@Component({
  selector: 'app-dettaglio-prenotazione-docente',
  templateUrl: './dettaglio-prenotazione-docente.page.html',
  styleUrls: ['./dettaglio-prenotazione-docente.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterLink, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, DashboardLayoutComponent ]})

  export class DettaglioPrenotazioneDocentePage implements OnInit, OnDestroy {
  private map: L.Map | null = null;
  public prenotazione: Prenotazione | null = null;
  public loading = true;
  public note = '';
  public fileDaCaricare: File[] = [];
  public uploadInProgress = false;

  constructor(
    private route: ActivatedRoute,
    private prenotazioneService: PrenotazioneService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      return;
    }
    try {
      this.prenotazione = await firstValueFrom(this.prenotazioneService.getPrenotazioneById(id));
    } catch (err) {
      console.error('Errore caricamento prenotazione', err);
    }
    this.loading = false;
    setTimeout(() => this.initMap(), 500);
  }

  private initMap() {
    if (this.map) return;
    const container = document.getElementById('map-docente');
    if (!container || !this.prenotazione?.luogoRicevimento?.latitudine || !this.prenotazione?.luogoRicevimento?.longitudine) return;

    this.map = L.map('map-docente', { zoomControl: false }).setView(
      [this.prenotazione.luogoRicevimento.latitudine, this.prenotazione.luogoRicevimento.longitudine], 15
    );

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    const markerIcon = L.divIcon({
      className: 'custom-marker-icon',
      html: '<div style="background:#2563eb;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    L.marker([this.prenotazione.luogoRicevimento.latitudine, this.prenotazione.luogoRicevimento.longitudine], { icon: markerIcon }).addTo(this.map)
      .bindPopup(`
        <div style="padding:5px;min-width:150px;">
          <strong style="color:#2563eb;">${this.prenotazione.luogoRicevimento.aula || 'Luogo'}</strong><br>
          <span style="color:#64748b;">Edificio ${this.prenotazione.luogoRicevimento.edificio || '-'}</span>
        </div>
      `);

    setTimeout(() => this.map?.invalidateSize(), 800);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  getIniziali(nome?: string): string {
    if (!nome) return '??';
    return nome.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  formattaData(data: string): string {
    if (!data) return '';
    const [y, m, d] = data.split('-');
    return `${d}/${m}/${y}`;
  }

  private statoBase(stato: string): string {
    if (!stato) return '';
    const s = stato.toLowerCase();
    if (s === 'confermata') return 'confermata';
    if (s === 'in_attesa') return 'in_attesa';
    if (s === 'completata') return 'completata';
    if (s === 'annullata') return 'annullata';
    if (s === 'rifiutata') return 'rifiutata';
    return '';
  }

  getStatusClass(stato: string): string {
    const map: Record<string, string> = { confermata: 'confirmed', in_attesa: 'waiting', completata: 'completed', annullata: 'cancelled', rifiutata: 'cancelled' };
    return map[this.statoBase(stato)] || '';
  }

  isStato(stato: string, atteso: string): boolean {
    return this.statoBase(stato) === atteso;
  }

  getDocumentIcon(type: string): string {
    const map: Record<string, string> = { pdf: 'document-outline', doc: 'document-text-outline', docx: 'document-text-outline' };
    return map[type] || 'document-outline';
  }

  async confermaPrenotazione() {
    if (!this.prenotazione) return;
    try {
      const resp = await firstValueFrom(this.prenotazioneService.aggiornaStatoPrenotazione(this.prenotazione.id, 'confermata'));
      if (resp?.stato) this.prenotazione.stato = resp.stato;
    } catch (err) {
      console.error('Errore conferma prenotazione', err);
    }
  }

  async annullaPrenotazione() {
    if (!this.prenotazione) return;
    try {
      const resp = await firstValueFrom(this.prenotazioneService.aggiornaStatoPrenotazione(this.prenotazione.id, 'annullata'));
      if (resp?.stato) this.prenotazione.stato = resp.stato;
    } catch (err) {
      console.error('Errore annullamento prenotazione', err);
    }
  }

  apriFile(percorso?: string) {
    if (!percorso) return;
    const nomeFile = percorso.split(/[\\/]/).pop();
    const url = this.authService.getApiUrl() + '/uploads/' + nomeFile;
    window.open(url, '_blank');
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.fileDaCaricare.push(files[i]);
      }
    }
  }

  rimuoviFile(index: number) {
    this.fileDaCaricare.splice(index, 1);
  }

  async caricaDocumenti() {
    if (!this.prenotazione || this.fileDaCaricare.length === 0) return;

    this.uploadInProgress = true;
    const formData = new FormData();
    this.fileDaCaricare.forEach(file => formData.append('files', file));

    try {
      this.prenotazione = await firstValueFrom(
        this.prenotazioneService.aggiungiDocumenti(this.prenotazione.id, formData)
      );
      this.fileDaCaricare = [];
    } catch (err) {
      console.error('Errore caricamento documenti', err);
    } finally {
      this.uploadInProgress = false;
    }
  }

}
