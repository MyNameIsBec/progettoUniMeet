import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonInput, IonItem, IonTextarea } from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { DashboardLayoutComponent } from 'src/app/components/dashboard-layout/dashboard-layout.component';
import { SegnalazioneService, Segnalazione } from 'src/app/core/services/segnalazione';
import { AuthService } from 'src/app/core/services/auth';
import { ErroriService } from 'src/app/core/services/errori';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import { sendOutline } from 'ionicons/icons';

@Component({
  selector: 'app-segnalazioni-studente',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonInput, IonTextarea, DashboardLayoutComponent],
  templateUrl: './segnalazioni-studente.page.html',
  styleUrls: ['./segnalazioni-studente.page.scss'],
})

export class SegnalazioniStudentePage implements OnInit {
  segnalazioni: Segnalazione[] = [];
  selectedFile: File | null = null;
  invioInCorso: boolean = false;

  form = {
    oggetto: '',
    descrizione: ''
  };

  info = {
    totali: 0,
    aperte: 0,
    risolte: 0
  };

  constructor(
    private segnalazioneService: SegnalazioneService, 
    private authService: AuthService,
    private erroriService: ErroriService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ sendOutline });
  }

  async eliminaSegnalazione(id: string) {
    const alert = await this.alertController.create({
      header: 'Conferma Eliminazione',
      message: 'Vuoi eliminare questa segnalazione dallo storico? Questa azione è irreversibile.',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          cssClass: 'delete-button-confirm',
          handler: () => {
            console.log('Tentativo eliminazione segnalazione ID:', id);
            this.segnalazioneService.eliminaSegnalazione(id).subscribe({
              next: async () => {
                console.log('Eliminazione segnalazione riuscita sul backend');
                this.caricaSegnalazioni();
                const toast = await this.toastController.create({
                  message: 'Segnalazione eliminata con successo',
                  duration: 2000,
                  color: 'success',
                  position: 'bottom'
                });
                await toast.present();
              },
              error: (err) => {
                console.error('Errore durante l\'eliminazione segnalazione', err);
                this.erroriService.gestoreErrori(err);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  ngOnInit() {
    this.caricaSegnalazioni();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Il file è troppo grande. Massimo 5MB.');
        return;
      }
      this.selectedFile = file;
    }
  }

  caricaSegnalazioni() {
    const user = this.authService.getCurrentUser();
    let matricola = '';
    if (user != null) {
      matricola = user.id;
    } else {
      return;
    }

    this.segnalazioneService.getSegnalazioniByStudente(matricola).subscribe({
      next: (data) => {
        this.segnalazioni = data;
        this.aggiornaStatistiche();
      },
      error: (err) => {
        console.error('Errore caricamento segnalazioni', err);
        this.erroriService.gestoreErrori(err);
      }
    });
  }

  aggiornaStatistiche() {
    this.info.totali = this.segnalazioni.length;
    this.info.aperte = this.segnalazioni.filter(s => s.stato === 'APERTA' || s.stato === 'IN_LAVORAZIONE').length;
    this.info.risolte = this.segnalazioni.filter(s => s.stato === 'CHIUSA').length;
  }

  inviaSegnalazione() {
    const user = this.authService.getCurrentUser();
    let matricola = '';

    if (user != null && this.form.oggetto != '' && this.form.descrizione != '') {
      matricola = user.id;
    } else {
      return;
    }

    this.invioInCorso = true;
    this.segnalazioneService.inviaSegnalazione(
      this.form.oggetto,
      this.form.descrizione,
      matricola,
      this.selectedFile
    ).subscribe({
      next: async () => {
        this.form = { oggetto: '', descrizione: '' };
        this.selectedFile = null;
        this.invioInCorso = false;
        this.caricaSegnalazioni();
        const toast = await this.toastController.create({
          message: 'Segnalazione inviata con successo!',
          duration: 2000,
          color: 'success',
          position: 'bottom'
        });
        await toast.present();
      },
      error: (err) => {
        console.error('Errore invio segnalazione', err);
        this.invioInCorso = false;
        this.erroriService.gestoreErrori(err);
      }
    });
  }

  getStatusColor(stato: string): string {
    switch (stato) {
      case 'APERTA': return 'warning';
      case 'IN_LAVORAZIONE': return 'primary';
      case 'CHIUSA': return 'success';
      default: return 'medium';
    }
  }
}