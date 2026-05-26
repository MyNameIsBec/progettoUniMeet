import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonSelect, IonSelectOption, IonChip, IonLabel} from '@ionic/angular/standalone';
import { AlertController, IonicSafeString } from '@ionic/angular';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { SegnalazioneService, Segnalazione } from 'src/app/core/services/segnalazione';
import { AuthService } from 'src/app/core/services/auth';

@Component({
  selector: 'app-gestione-segnalazioni',
  templateUrl: './gestione-segnalazioni.page.html',
  styleUrls: ['./gestione-segnalazioni.page.scss'],
  standalone: true,
  imports: [ IonIcon, IonSelect, IonSelectOption, IonChip, IonLabel, CommonModule, FormsModule, DashboardLayoutComponent]})

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

  cambiaStato(segnalazione: any, nuovoStato: string) {
    this.segnalazioneService.aggiornaStato(segnalazione.id_segnalazione, nuovoStato).subscribe({
      next: () => this.caricaSegnalazioni(this.filtroStato || undefined),
    });
  }

  getAllegatoUrl(percorso: string | null | undefined): string {
    if (!percorso) return '';
    const nomeFile = percorso.split(/[\\/]/).pop();
    return this.authService.getApiUrl() + '/uploads/' + nomeFile;
  }

  async dettagli(s: any) {
    const allegatoHtml = s.allegato
      ? `<div style="margin-bottom:8px"><strong>Allegato:</strong> <a href="${this.getAllegatoUrl(s.allegato)}" target="_blank" style="color:#2563eb;text-decoration:underline;">Visualizza allegato</a></div>`
      : '<div style="margin-bottom:8px"><strong>Allegato:</strong> Nessuno</div>';

    const utenteInfo = s.studente
      ? `
        <div style="margin-bottom:8px"><strong>Studente:</strong> ${s.studente.nome} ${s.studente.cognome}</div>
        <div style="margin-bottom:8px"><strong>Matricola:</strong> ${s.matricola_studente}</div>
        <div style="margin-bottom:8px"><strong>Email:</strong> ${s.studente.email}</div>
      `
      : s.docente
        ? `
          <div style="margin-bottom:8px"><strong>Docente:</strong> ${s.docente.nome} ${s.docente.cognome}</div>
          <div style="margin-bottom:8px"><strong>ID Docente:</strong> ${s.id_docente}</div>
          <div style="margin-bottom:8px"><strong>Email:</strong> ${s.docente.email}</div>
        `
        : `
          <div style="margin-bottom:8px"><strong>Utente:</strong> -</div>
        `;

    const alert = await this.alertController.create({
      header: 'Dettagli segnalazione',
      subHeader: s.oggetto,
      message: new IonicSafeString(`
        <div style="margin-bottom:12px"><strong>Descrizione:</strong><br>${s.descrizione}</div>
        ${utenteInfo}
        <div style="margin-bottom:8px"><strong>Data invio:</strong> ${new Date(s.data_invio).toLocaleString('it-IT')}</div>
        ${allegatoHtml}
        <div><strong>Stato:</strong> ${this.statoLabel(s.stato)}</div>
      `),
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
