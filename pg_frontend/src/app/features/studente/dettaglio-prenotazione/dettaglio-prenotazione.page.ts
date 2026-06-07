import { Component, OnInit, inject, OnDestroy } from '@angular/core';import { ActivatedRoute, Router, RouterLink } from '@angular/router';import { CommonModule } from '@angular/common';import * as L from 'leaflet';import { Geolocation } from '@capacitor/geolocation';import { IonIcon, IonCard, IonCardContent, IonButton, IonSpinner, IonContent } from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { AuthService } from '../../../core/services/auth';
import { Prenotazione } from '../../../core/models/interfacce';
@Component({
  selector: 'app-dettaglio-prenotazione',
  templateUrl: './dettaglio-prenotazione.page.html',
  styleUrls: ['./dettaglio-prenotazione.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonIcon,
    IonCard,
    IonCardContent,
    IonButton,
    IonSpinner,
    DashboardLayoutComponent
  ]
})
export class DettaglioPrenotazionePage implements OnInit, OnDestroy {
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);  prenotazione: Prenotazione | null = null;  loading = true;  error = false;  title = "LUOGO RICEVIMENTO";  private map: L.Map | undefined;  private userMarker: L.Marker | undefined;  private meetingMarker: L.Marker | undefined;  private userIcon = L.divIcon({    className: 'custom-marker user-location',    html: `<div class="marker-pin"></div><div class="marker-pulse"></div>`,    iconSize: [30, 30],    iconAnchor: [15, 15]  });  private meetingIcon = L.divIcon({    className: 'custom-marker meeting-location',    html: `<div class="marker-pin"></div>`,    iconSize: [30, 30],    iconAnchor: [15, 15]  });  private prenotazioneService = inject(PrenotazioneService);  private authService = inject(AuthService);  private route = inject(ActivatedRoute);  private router = inject(Router);  constructor() { }  ngOnInit() {    const id = this.route.snapshot.paramMap.get('id');    if (id) {      this.caricaDettagli(id);    } else {      this.error = true;      this.loading = false;    }  }  ngOnDestroy() {    if (this.map) {      this.map.remove();    }  }  ionViewDidEnter() {    if (this.map) {      this.map.invalidateSize();    }  }  private initMap() {    if (this.map) return;    const container = document.getElementById('map');    if (!container) {      console.error('Div mappa non trovato');      setTimeout(() => this.initMap(), 200);      return;    }    this.map = L.map('map', {      zoomControl: false    }).setView([38.1156, 13.3614], 13);    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {      maxZoom: 19,      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'    }).addTo(this.map);    L.control.zoom({      position: 'bottomright'    }).addTo(this.map);    setTimeout(() => {      if (this.map) {        this.map.invalidateSize();      }    }, 800);  }  private refreshMarkers() {    if (!this.map || !this.prenotazione) return;    if (this.meetingMarker) this.map.removeLayer(this.meetingMarker);    if (this.userMarker) this.map.removeLayer(this.userMarker);    const lat = this.prenotazione.luogoRicevimento?.latitudine || 38.1156;    const lng = this.prenotazione.luogoRicevimento?.longitudine || 13.3614;    this.meetingMarker = L.marker([lat, lng], { icon: this.meetingIcon }).addTo(this.map).bindPopup(`        <div style="padding: 5px; min-width: 150px;">          <div style="color: #2563eb; font-weight: 900; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;">            Luogo Ricevimento          </div>          <div style="font-size: 1.1rem; font-weight: 950; color: #0f172a; margin-bottom: 4px;">            ${this.prenotazione.luogoRicevimento?.aula || 'Aula da definire'}          </div>          <div style="color: #64748b; font-size: 0.9rem; font-weight: 700;">            Edificio ${this.prenotazione.luogoRicevimento?.edificio || '-'} • Piano ${this.prenotazione.luogoRicevimento?.piano ?? '-'}          </div>        </div>      `);    this.map.setView([lat, lng], 15);    this.trackUserLocation().then(coords => {      if (!coords || !this.map) return;      const userLatLng: L.LatLngExpression = [coords.latitude, coords.longitude];      this.userMarker = L.marker(userLatLng, { icon: this.userIcon })        .addTo(this.map)        .bindPopup('Tua posizione');      if (this.meetingMarker) {        const group = L.featureGroup([this.userMarker, this.meetingMarker]);        this.map.fitBounds(group.getBounds().pad(0.5), { maxZoom: 16 });      }    });  }  private async trackUserLocation() {    try {      const coordinates = await Geolocation.getCurrentPosition({        enableHighAccuracy: true,        timeout: 5000      });      return coordinates.coords;    } catch (error) {      console.error('Errore GPS:', error);      return { latitude: 38.1156, longitude: 13.3614 };     }  }  private fitMapBounds() {    if (!this.map || !this.meetingMarker) return;    if (this.userMarker) {      const group = L.featureGroup([this.userMarker, this.meetingMarker]);      this.map.fitBounds(group.getBounds().pad(0.5));    } else {      this.map.setView(this.meetingMarker.getLatLng(), 15);    }  }  caricaDettagli(id: string) {    this.loading = true;    this.prenotazioneService.getPrenotazioneById(id).subscribe({      next: (data) => {        this.prenotazione = data;        this.loading = false;        setTimeout(() => {          this.initMap();          this.refreshMarkers();        }, 800);      },      error: (err) => {        console.error('Errore caricamento prenotazione', err);        this.error = true;        this.loading = false;      }    });  }    async annulla() {
    if (!this.prenotazione) return;
    const alert = await this.alertCtrl.create({
      header: 'Annulla prenotazione',
      message: 'Sei sicuro di voler annullare questa prenotazione?',
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Sì', handler: () => {
          this.prenotazioneService.annullaPrenotazione(this.prenotazione!.id).subscribe({
            next: () => {
              this.router.navigate(['/riepilogo-prenotazioni']);
            },
            error: async (err) => {
              const toast = await this.toastCtrl.create({ message: err.error?.error || 'Errore durante l\'annullamento della prenotazione', duration: 3000, color: 'danger' });
              await toast.present();
              console.error(err);
            }
          });
        }},
      ],
    });
    await alert.present();
  }  getStatoLabel(stato: string): string {    const labels: Record<string, string> = {      'confermata': 'Confermata',      'in_attesa': 'In attesa',      'annullata': 'Annullata',      'completata': 'Completata'    };    return labels[stato] || stato;  }  getArgomentoLabel(argomento: string | undefined): string {    const labels: Record<string, string> = {      'chiarimenti': 'Chiarimenti Lezione',      'tesi': 'Discussione Tesi',      'progetto': 'Revisione Progetto',      'esame': 'Info Esame',      'altro': 'Altro',    };    return labels[argomento || ''] || argomento || 'Generale';  }  getStatoColor(stato: string): string {    const colors: Record<string, string> = {      'confermata': 'success',      'in_attesa': 'warning',      'annullata': 'danger',      'completata': 'medium'    };    return colors[stato] || 'primary';  }  apriDocumento(percorso: string) {    if (!percorso) return;    const nomeFile = percorso.split(/[\\/]/).pop();    const url = this.authService.getApiUrl() + '/uploads/' + nomeFile;    window.open(url, '_blank');  }}
