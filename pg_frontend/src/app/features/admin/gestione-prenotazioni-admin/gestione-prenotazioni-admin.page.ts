import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonIcon, IonChip, IonLabel, IonSelect, IonSelectOption, AlertController,
} from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AdminService, PrenotazioneAdmin } from 'src/app/core/services/admin';

@Component({
  selector: 'app-gestione-prenotazioni-admin',
  templateUrl: './gestione-prenotazioni-admin.page.html',
  styleUrls: ['./gestione-prenotazioni-admin.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonChip, IonLabel, IonSelect, IonSelectOption,
    CommonModule, FormsModule, DashboardLayoutComponent,
  ],
})
export class GestionePrenotazioniAdminPage implements OnInit {
  prenotazioni: PrenotazioneAdmin[] = [];
  filtroStato = '';
  inCaricamento = false;

  constructor(
    private admin: AdminService,
    private route: ActivatedRoute,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    if (params['stato']) this.filtroStato = params['stato'];
    this.caricaPrenotazioni();
  }

  caricaPrenotazioni(stato?: string) {
    this.inCaricamento = true;
    const filtri: any = {};
    if (stato) filtri.stato = stato;
    this.admin.getPrenotazioni(Object.keys(filtri).length ? filtri : undefined).subscribe({
      next: (data) => {
        this.prenotazioni = data;
        this.inCaricamento = false;
      },
      error: () => this.inCaricamento = false,
    });
  }

  onFiltroStato(stato: string) {
    this.filtroStato = stato;
    this.caricaPrenotazioni(stato || undefined);
  }

  cambiaStato(p: PrenotazioneAdmin, nuovoStato: string) {
    this.admin.aggiornaStatoPrenotazione(p.id, nuovoStato).subscribe({
      next: () => this.caricaPrenotazioni(this.filtroStato || undefined),
    });
  }

  async dettagli(p: PrenotazioneAdmin) {
    const alert = await this.alertController.create({
      header: 'Dettagli prenotazione',
      subHeader: p.argomento,
      message: `
        <div style="margin-bottom:12px"><strong>Descrizione:</strong><br>${p.descrizione || '—'}</div>
        <div style="margin-bottom:8px"><strong>Studente:</strong> ${p.studente.nome} ${p.studente.cognome} (${p.studente.matricola})</div>
        <div style="margin-bottom:8px"><strong>Email:</strong> ${p.studente.email}</div>
        <div style="margin-bottom:8px"><strong>Docente:</strong> ${p.docente.nome} ${p.docente.cognome}</div>
        <div style="margin-bottom:8px"><strong>Slot:</strong> ${this.formattaData(p.slot.data)} — ${p.slot.oraInizio} - ${p.slot.oraFine}</div>
        <div style="margin-bottom:8px"><strong>Stato:</strong> ${this.statoLabel(p.stato)}</div>
        <div><strong>Documenti:</strong> ${p.documentiCount}</div>
      `,
      buttons: ['Chiudi'],
    });
    await alert.present();
  }

  async confermaEliminazione(p: PrenotazioneAdmin) {
    const alert = await this.alertController.create({
      header: 'Conferma eliminazione',
      message: `Eliminare la prenotazione "${p.argomento}" di ${p.studente.nome} ${p.studente.cognome}?`,
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: () => {
            this.admin.eliminaPrenotazione(p.id).subscribe({
              next: () => this.caricaPrenotazioni(this.filtroStato || undefined),
            });
          },
        },
      ],
    });
    await alert.present();
  }

  statoLabel(stato: string): string {
    const map: Record<string, string> = {
      IN_ATTESA: 'In attesa',
      CONFERMATA: 'Confermata',
      RIFIUTATA: 'Rifiutata',
      ANNULLATA: 'Annullata',
    };
    return map[stato] ?? stato;
  }

  statoIcona(stato: string): string {
    const map: Record<string, string> = {
      IN_ATTESA: 'time-outline',
      CONFERMATA: 'checkmark-circle-outline',
      RIFIUTATA: 'close-circle-outline',
      ANNULLATA: 'ban-outline',
    };
    return map[stato] ?? 'help-circle-outline';
  }

  statoClasse(stato: string): string {
    return 'stato-' + stato.toLowerCase();
  }

  formattaData(data: string): string {
    const d = new Date(data + 'T00:00:00');
    return d.toLocaleDateString('it-IT', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  formattaDataOra(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('it-IT');
  }
}
