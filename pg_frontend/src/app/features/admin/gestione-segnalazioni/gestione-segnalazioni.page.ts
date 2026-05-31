import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonChip, IonLabel} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { SegnalazioneService, Segnalazione } from 'src/app/core/services/segnalazione';
import { AuthService } from 'src/app/core/services/auth';

@Component({
  selector: 'app-gestione-segnalazioni',
  templateUrl: './gestione-segnalazioni.page.html',
  styleUrls: ['./gestione-segnalazioni.page.scss'],
  standalone: true,
  imports: [ IonIcon, IonChip, IonLabel, CommonModule, FormsModule, DashboardLayoutComponent]})

  export class GestioneSegnalazioniPage implements OnInit {
  segnalazioni: Segnalazione[] = [];
  filtroStato = '';
  inCaricamento = false;

  constructor(
    private segnalazioneService: SegnalazioneService,
    private authService: AuthService,
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

  async cambiaStato(segnalazione: any) {
    const alert = await this.alertController.create({
      header: 'Cambia stato',
      subHeader: segnalazione.oggetto,
      inputs: [
        { name: 'noteAdmin', type: 'textarea', placeholder: 'Note opzionali per il destinatario...' },
      ],
      buttons: [
        {
          text: 'Aperta',
          handler: (data) => {
            const noteAdmin = data?.noteAdmin?.trim() || undefined;
            this.segnalazioneService.aggiornaStato(segnalazione.id_segnalazione, 'APERTA', noteAdmin).subscribe({
              next: () => this.caricaSegnalazioni(this.filtroStato || undefined),
            });
          },
        },
        {
          text: 'In lavorazione',
          handler: (data) => {
            const noteAdmin = data?.noteAdmin?.trim() || undefined;
            this.segnalazioneService.aggiornaStato(segnalazione.id_segnalazione, 'IN_LAVORAZIONE', noteAdmin).subscribe({
              next: () => this.caricaSegnalazioni(this.filtroStato || undefined),
            });
          },
        },
        {
          text: 'Chiusa',
          handler: (data) => {
            const noteAdmin = data?.noteAdmin?.trim() || undefined;
            this.segnalazioneService.aggiornaStato(segnalazione.id_segnalazione, 'CHIUSA', noteAdmin).subscribe({
              next: () => this.caricaSegnalazioni(this.filtroStato || undefined),
            });
          },
        },
        { text: 'Annulla', role: 'cancel' },
      ],
    });
    await alert.present();
  }

  getAllegatoUrl(percorso: string | null | undefined): string {
    if (!percorso) return '';
    const nomeFile = percorso.split(/[\\/]/).pop();
    return this.authService.getApiUrl() + '/uploads/' + nomeFile;
  }

  async dettagli(s: any) {
    const nomeUtente = s.studente
      ? s.studente.nome + ' ' + s.studente.cognome + ' (Matr. ' + s.matricola_studente + ')'
      : s.docente
        ? s.docente.nome + ' ' + s.docente.cognome + ' (Docente)'
        : '-';

    const emailUtente = s.studente?.email || s.docente?.email || '-';

    let msg = '';
    msg += 'DESCRIZIONE\n' + (s.descrizione || '') + '\n\n';
    msg += 'UTENTE\n' + nomeUtente + '\n' + emailUtente + '\n\n';
    msg += 'DATA INVIO\n' + new Date(s.data_invio).toLocaleString('it-IT') + '\n\n';
    msg += 'STATO\n' + this.statoLabel(s.stato) + '\n\n';
    msg += 'ALLEGATO\n' + (s.allegato ? this.getAllegatoUrl(s.allegato) : 'Nessuno');

    if (s.note_admin) {
      msg += '\n\nNOTA ADMIN\n' + s.note_admin;
    }

    const alert = await this.alertController.create({
      header: 'Dettagli segnalazione',
      subHeader: s.oggetto,
      message: msg,
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
    return map[stato] ?? 'help-circle-outline';
  }
}
