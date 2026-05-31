import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonChip, IonLabel} from '@ionic/angular/standalone';
import { AlertController, IonicSafeString } from '@ionic/angular';
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
    const utenteInfo = s.studente
      ? `<strong>Studente:</strong> ${s.studente.nome} ${s.studente.cognome} (${s.matricola_studente})<br><strong>Email:</strong> ${s.studente.email}`
      : s.docente
        ? `<strong>Docente:</strong> ${s.docente.nome} ${s.docente.cognome}<br><strong>Email:</strong> ${s.docente.email}`
        : '<strong>Utente:</strong> -';

    const alert = await this.alertController.create({
      header: 'Dettagli segnalazione',
      subHeader: s.oggetto,
      message: new IonicSafeString(
        '<div style="margin-bottom:12px;padding:12px;background:rgba(37,99,235,0.08);border-radius:10px;border-left:4px solid var(--primary-blue,#2563eb);white-space:pre-wrap;word-break:break-word;line-height:1.6">' +
        '<strong style="display:block;margin-bottom:6px">Descrizione</strong>' +
        this.escapeHtml(s.descrizione || '') +
        '</div>' +
        '<div style="margin-bottom:8px">' + utenteInfo + '</div>' +
        '<div style="margin-bottom:8px"><strong>Data invio:</strong> ' + new Date(s.data_invio).toLocaleString('it-IT') + '</div>' +
        '<div style="margin-bottom:8px"><strong>Stato:</strong> ' + this.statoLabel(s.stato) + '</div>' +
        (s.allegato
          ? '<div style="margin-bottom:8px"><strong>Allegato:</strong> <a href="' + this.getAllegatoUrl(s.allegato) + '" target="_blank" style="color:#2563eb;text-decoration:underline;">Visualizza allegato</a></div>'
          : '<div style="margin-bottom:8px"><strong>Allegato:</strong> Nessuno</div>') +
        (s.note_admin
          ? '<div style="margin-top:12px;padding:12px;background:rgba(22,163,74,0.1);border-radius:10px;border-left:4px solid #16a34a;white-space:pre-wrap"><strong style="color:#16a34a;display:block;margin-bottom:6px">Nota admin</strong>' + this.escapeHtml(s.note_admin) + '</div>'
          : '')
      ),
      buttons: ['Chiudi'],
    });
    await alert.present();
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
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
