import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonIcon, IonButton, IonSelect, IonSelectOption, IonChip, IonLabel,
} from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { VoceMenuNavigazione } from '../../../core/models/interfacce';
import { SegnalazioneService, Segnalazione } from 'src/app/core/services/segnalazione';

@Component({
  selector: 'app-gestione-segnalazioni',
  templateUrl: './gestione-segnalazioni.page.html',
  styleUrls: ['./gestione-segnalazioni.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonButton, IonSelect, IonSelectOption, IonChip, IonLabel,
    CommonModule, FormsModule, RouterLink, DashboardLayoutComponent,
  ],
})
export class GestioneSegnalazioniPage implements OnInit {
  segnalazioni: (Segnalazione & { studente?: { nome: string; cognome: string; email: string } })[] = [];
  filtroStato = '';
  inCaricamento = false;

  vociMenuAdmin: VoceMenuNavigazione[] = [
    { etichetta: 'Dashboard', percorso: '/dashboard-admin', icona: 'stats-chart-outline', esatto: true },
    { etichetta: 'Utenti', percorso: '/gestione-utenti-admin', icona: 'people-outline' },
    { etichetta: 'Slot', percorso: '/gestione-slot-admin', icona: 'calendar-outline' },
    { etichetta: 'Calendario', percorso: '/gestione-calendario', icona: 'calendar-outline' },
    { etichetta: 'Segnalazioni', percorso: '/gestione-segnalazioni', icona: 'flag-outline' },
  ];

  constructor(private segnalazioneService: SegnalazioneService) {}

  ngOnInit() {
    this.caricaSegnalazioni();
  }

  caricaSegnalazioni(stato?: string) {
    this.inCaricamento = true;
    this.segnalazioneService.getAllSegnalazioni(stato).subscribe({
      next: (data) => {
        this.segnalazioni = data;
        this.inCaricamento = false;
      },
      error: () => this.inCaricamento = false,
    });
  }

  onFiltroStato(stato: string) {
    this.filtroStato = stato;
    this.caricaSegnalazioni(stato || undefined);
  }

  cambiaStato(segnalazione: any, nuovoStato: string) {
    this.segnalazioneService.aggiornaStato(segnalazione.id_segnalazione, nuovoStato).subscribe({
      next: () => this.caricaSegnalazioni(this.filtroStato || undefined),
    });
  }

  statoLabel(stato: string): string {
    const map: Record<string, string> = {
      APERTA: 'Aperta',
      IN_LAVORAZIONE: 'In lavorazione',
      CHIUSA: 'Chiusa',
    };
    return map[stato] ?? stato;
  }

  statoIcona(stato: string): string {
    const map: Record<string, string> = {
      APERTA: 'alert-circle-outline',
      IN_LAVORAZIONE: 'time-outline',
      CHIUSA: 'checkmark-circle-outline',
    };
    return map[stato] ?? 'help-outline';
  }
}
