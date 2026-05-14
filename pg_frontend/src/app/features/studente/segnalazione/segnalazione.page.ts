import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonInput, IonItem, IonTextarea, } from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from 'src/app/components/dashboard-layout/dashboard-layout.component';
import { SegnalazioneService, Segnalazione } from 'src/app/core/services/segnalazione';
import { AuthService } from 'src/app/core/services/auth';

@Component({
  selector: 'app-segnalazione',
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonInput, IonTextarea, DashboardLayoutComponent],
  templateUrl: './segnalazione.page.html',
  styleUrls: ['./segnalazione.page.scss'],
})

export class SegnalazionePage implements OnInit {
  segnalazioni: Segnalazione[] = [];

  form = {
    oggetto: '',
    descrizione: ''
  };

  info = {
    totali: 0,
    aperte: 0,
    risolte: 0
  };

  invioInCorso: boolean = false;

  constructor(private segnalazioneService: SegnalazioneService, private authService: AuthService) { }

  ngOnInit() {
    this.caricaSegnalazioni();
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
      error: (err) => console.error('Errore caricamento segnalazioni', err)
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
      matricola
    ).subscribe({
      next: () => {
        this.form = { oggetto: '', descrizione: '' };
        this.invioInCorso = false;
        this.caricaSegnalazioni();
      },
      error: (err) => {
        console.error('Errore invio segnalazione', err);
        this.invioInCorso = false;
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