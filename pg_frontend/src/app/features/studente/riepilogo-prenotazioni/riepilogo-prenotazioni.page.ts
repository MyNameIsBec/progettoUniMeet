import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonCard, IonCardContent, IonButton, IonBadge, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { Prenotazione } from 'src/app/core/models/interfacce';
import { AuthService } from '../../../core/services/auth';
import { StudenteService } from '../../../core/services/studente';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { firstValueFrom } from 'rxjs';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-riepilogo-prenotazioni',
  templateUrl: './riepilogo-prenotazioni.page.html',
  styleUrls: ['./riepilogo-prenotazioni.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonIcon, IonCard, IonCardContent, IonButton, IonBadge, IonSelect, IonSelectOption, DashboardLayoutComponent]
})
export class RiepilogoPrenotazioniPage implements OnInit {
  public listaPrenotazioni: Prenotazione[] = [];
  public prenotazioniOriginali: Prenotazione[] = []; // Backup per il filtraggio

  public ricerca: string = '';
  public statoSelezionato: string = 'future';

  constructor(
    private authService: AuthService, 
    private prenotazioneService: PrenotazioneService, 
    private studenteService: StudenteService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    try {
      const user = this.authService.getCurrentUser();
      if (user != null) {
        this.prenotazioniOriginali = await firstValueFrom(this.prenotazioneService.getPrenotazioniStudente(user.id));
        this.prenotazioniOriginali.sort((a, b) => {
          const cmp = b.data.localeCompare(a.data);
          if (cmp !== 0) return cmp;
          return (b.ora || '').localeCompare(a.ora || '');
        });
        this.listaPrenotazioni = [...this.prenotazioniOriginali];
      }
    }
    catch (error) {
      console.error('Errore durante il caricamento delle prenotazioni', error);
    }
  }

  async eliminaPrenotazione(id: string) {
    const alert = await this.alertController.create({
      header: 'Conferma Eliminazione',
      message: 'Sei sicuro di voler eliminare questa prenotazione dallo storico? Questa azione è irreversibile.',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          cssClass: 'delete-button-confirm',
          handler: () => {
            this.prenotazioneService.eliminaPrenotazione(id).subscribe({
              next: async () => {
                this.prenotazioniOriginali = [...this.prenotazioniOriginali.filter(p => p.id !== id)];
                this.listaPrenotazioni = [...this.prenotazioniOriginali];
                this.applicaFiltri();
                
                const toast = await this.toastController.create({
                  message: 'Prenotazione eliminata con successo',
                  duration: 2000,
                  color: 'success',
                  position: 'bottom'
                });
                await toast.present();
              },
              error: async (err) => {
                console.error('Errore durante l\'eliminazione', err);
                const toast = await this.toastController.create({
                  message: 'Errore durante l\'eliminazione: ' + (err.error?.error || 'Server error'),
                  duration: 3000,
                  color: 'danger'
                });
                await toast.present();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  cerca() {
    this.applicaFiltri();
  }

  onFilterStato(event: any) {
    this.statoSelezionato = event.detail.value;
    this.applicaFiltri();
  }

  applicaFiltri() {
    const adesso = new Date();
    this.listaPrenotazioni = this.prenotazioniOriginali.filter(p => {
      const matchRicerca = !this.ricerca ||
        p.docente.toLowerCase().includes(this.ricerca.toLowerCase()) ||
        p.materia.toLowerCase().includes(this.ricerca.toLowerCase());

      let matchStato = true;
      if (this.statoSelezionato === 'future') {
        matchStato = (p.stato === 'confermata' || p.stato === 'in_attesa') &&
          new Date(`${p.data}T${p.ora}`) > adesso;
      } else if (this.statoSelezionato === 'confermata' || this.statoSelezionato === 'in_attesa') {
        matchStato = p.stato === this.statoSelezionato && new Date(`${p.data}T${p.ora}`) > adesso;
      } else if (this.statoSelezionato !== 'tutti') {
        matchStato = p.stato === this.statoSelezionato;
      }

      return matchRicerca && matchStato;
    });
  }

  getColoreStato(stato: string): string {
    switch (stato) {
      case 'confermata': return 'success';
      case 'in_attesa': return 'warning';
      case 'annullata': return 'danger';
      case 'completata': return 'medium';
      default: return 'primary';
    }
  }
}
