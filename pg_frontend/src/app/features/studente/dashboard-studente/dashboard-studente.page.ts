import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton
} from '@ionic/angular/standalone';
import { Prenotazione } from '../../../core/models/interfacce';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { AuthService } from '../../../core/services/auth';
import { FAQ } from '../../../core/models/interfacce';

import { BachecaService } from '../../../core/services/bacheca';
import { StudenteService } from '../../../core/services/studente';

import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-dashboard-studente',
  templateUrl: './dashboard-studente.page.html',
  styleUrls: ['./dashboard-studente.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, DashboardLayoutComponent]
})

export class DashboardStudentePage implements OnInit, OnDestroy {
  public nomeStudente: string = 'Studente';
  public prossimoRicevimento: Prenotazione | null = null;
  public listaPrenotazioni: Prenotazione[] = [];
  public listaFaq: FAQ[] = [];
  idStudenteCorrente: string = '';
  
  private userSub: Subscription | null = null;

  constructor(
    private prenotazioneService: PrenotazioneService,
    private authService: AuthService,
    private bachecaService: BachecaService,
    private studenteService: StudenteService
  ) { }

  async ngOnInit() {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.nomeStudente = user.nome;
        this.idStudenteCorrente = user.id;
        this.caricaDatiDashboard(user.id);
      }
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  private async caricaDatiDashboard(matricola: string) {
    try {
      // Recupera il profilo completo per conoscere il corso di studi
      const profilo = await firstValueFrom(this.studenteService.getProfilo(matricola));
      
      if (profilo.corsoDiStudi) {
        // Carica le FAQ specifiche del corso
        const bacheca = await firstValueFrom(this.bachecaService.getBachecaPerCorso(profilo.corsoDiStudi));
        if (bacheca && bacheca.faqs) {
          this.listaFaq = bacheca.faqs;
        }
      }

      this.listaPrenotazioni = await firstValueFrom(this.prenotazioneService.getPrenotazioniStudente(matricola));

      // Imposta il prossimo ricevimento (il primo della lista se presente)
      if (this.listaPrenotazioni.length > 0) {
        this.prossimoRicevimento = this.listaPrenotazioni[0];
      }
    } catch (err) {
      console.error('Errore caricamento dati dashboard', err);
    }
  }
}