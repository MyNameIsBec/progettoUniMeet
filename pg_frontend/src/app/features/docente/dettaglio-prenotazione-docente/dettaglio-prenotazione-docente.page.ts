import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonTextarea, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { AuthService } from '../../../core/services/auth';
import { Prenotazione } from '../../../core/models/interfacce';

@Component({
  selector: 'app-dettaglio-prenotazione-docente',
  templateUrl: './dettaglio-prenotazione-docente.page.html',
  styleUrls: ['./dettaglio-prenotazione-docente.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonTextarea,
    IonHeader, IonToolbar, IonTitle, IonContent,
    DashboardLayoutComponent
  ]
})
export class DettaglioPrenotazioneDocentePage implements OnInit {
  public prenotazione: Prenotazione | null = null;
  public loading = true;
  public note = '';

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

  getStatusClass(stato: string): string {
    const map: Record<string, string> = { confermata: 'confirmed', in_attesa: 'waiting', completata: 'completed', annullata: 'cancelled' };
    return map[stato] || '';
  }

  getDocumentIcon(type: string): string {
    const map: Record<string, string> = { pdf: 'document-outline', doc: 'document-text-outline', docx: 'document-text-outline' };
    return map[type] || 'document-outline';
  }

  async confermaPrenotazione() {
    if (!this.prenotazione) return;
    try {
      this.prenotazione = await firstValueFrom(this.prenotazioneService.aggiornaStatoPrenotazione(this.prenotazione.id, 'confermata'));
    } catch (err) {
      console.error('Errore conferma prenotazione', err);
    }
  }

  async annullaPrenotazione() {
    if (!this.prenotazione) return;
    try {
      this.prenotazione = await firstValueFrom(this.prenotazioneService.aggiornaStatoPrenotazione(this.prenotazione.id, 'annullata'));
    } catch (err) {
      console.error('Errore annullamento prenotazione', err);
    }
  }

  apriFile(url?: string) {
    if (url) window.open(url, '_blank');
  }

  salvaNote() {
    console.log('Note salvate:', this.note);
  }
}
