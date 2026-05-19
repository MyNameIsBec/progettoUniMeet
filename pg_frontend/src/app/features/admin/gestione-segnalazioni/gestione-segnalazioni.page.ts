import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonIcon, IonSelect, IonSelectOption, IonChip, IonLabel, AlertController,
} from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { SegnalazioneService, Segnalazione } from 'src/app/core/services/segnalazione';

@Component({
  selector: 'app-gestione-segnalazioni',
  templateUrl: './gestione-segnalazioni.page.html',
  styleUrls: ['./gestione-segnalazioni.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonSelect, IonSelectOption, IonChip, IonLabel,
    CommonModule, FormsModule, DashboardLayoutComponent,
  ],
})
export class GestioneSegnalazioniPage implements OnInit {
  segnalazioni: (Segnalazione & { studente?: { nome: string; cognome: string; email: string } })[] = [];
  filtroStato = '';
  inCaricamento = false;

  constructor(
    private segnalazioneService: SegnalazioneService,
    private alertController: AlertController,
  ) {}

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

  async dettagli(s: any) {
    const alert = await this.alertController.create({
      header: 'Dettagli segnalazione',
      subHeader: s.oggetto,
      message: `
        <div style="margin-bottom:12px"><strong>Descrizione:</strong><br>${s.descrizione}</div>
        <div style="margin-bottom:8px"><strong>Studente:</strong> ${s.studente?.nome ?? '-'} ${s.studente?.cognome ?? ''}</div>
        <div style="margin-bottom:8px"><strong>Matricola:</strong> ${s.matricola_studente}</div>
        <div style="margin-bottom:8px"><strong>Email:</strong> ${s.studente?.email ?? '-'}</div>
        <div style="margin-bottom:8px"><strong>Data invio:</strong> ${new Date(s.data_invio).toLocaleString('it-IT')}</div>
        <div><strong>Stato:</strong> ${this.statoLabel(s.stato)}</div>
      `,
      buttons: ['Chiudi'],
    });
    await alert.present();
  }

  async elimina(s: any) {
    const alert = await this.alertController.create({
      header: 'Conferma eliminazione',
      message: `Eliminare la segnalazione "${s.oggetto}"?`,
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: () => {
            this.segnalazioneService.eliminaSegnalazione(s.id_segnalazione).subscribe({
              next: () => this.caricaSegnalazioni(this.filtroStato || undefined),
            });
          },
        },
      ],
    });
    await alert.present();
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
