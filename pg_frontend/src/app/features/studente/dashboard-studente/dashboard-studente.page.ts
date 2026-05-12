import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton
} from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { Prenotazione } from '../../../core/models/interfacce';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-dashboard-studente',
  templateUrl: './dashboard-studente.page.html',
  styleUrls: ['./dashboard-studente.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, DashboardLayoutComponent]
})

export class DashboardStudentePage {
  public nomeStudente: string = 'Studente';

  public prossimoRicevimento: Prenotazione | null = null;

  public listaPrenotazioni: Prenotazione[] = [];
  idStudenteCorrente: string = '';

  constructor(
    private prenotazioneService: PrenotazioneService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.idStudenteCorrente = user.id;
      this.nomeStudente = user.nome;
    }

    this.listaPrenotazioni = await firstValueFrom(this.prenotazioneService.getPrenotazioniStudente(this.idStudenteCorrente));

    // Imposta il prossimo ricevimento (il primo della lista se presente)
    if (this.listaPrenotazioni.length > 0) {
      this.prossimoRicevimento = this.listaPrenotazioni[0];
    }
  }

}