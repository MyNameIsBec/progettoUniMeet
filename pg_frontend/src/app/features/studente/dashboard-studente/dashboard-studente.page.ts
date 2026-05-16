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
  public totaleConfermate: number = 0;
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

  ionViewWillEnter() {
    if (this.idStudenteCorrente) {
      this.caricaDatiDashboard(this.idStudenteCorrente);
    }
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  get prenotazioniFutureCount(): number {
    return this.totaleConfermate;
  }

  private async caricaDatiDashboard(matricola: string) {
    try {
      // Recupera il profilo completo per conoscere il corso di studi
      const profilo = await firstValueFrom(this.studenteService.getProfilo(matricola));
      
      if (profilo.corsoDiStudiId) {
        const bacheca = await firstValueFrom(this.bachecaService.getBachecaPerCorsoDiStudi(profilo.corsoDiStudiId));
        if (bacheca && bacheca.faqs) {
          this.listaFaq = bacheca.faqs;
        }
      }

      const tutte = await firstValueFrom(this.prenotazioneService.getPrenotazioniStudente(matricola));
      
      // 0. Conteggio totale confermate
      this.totaleConfermate = tutte.filter(p => p.stato === 'confermata').length;

      // 1. Lista visualizzata: Confermate o In attesa, ordinate per data DECRESCENTE (la più recente al posto 0)
      this.listaPrenotazioni = tutte
        .filter(p => p.stato === 'confermata' || p.stato === 'in_attesa')
        .sort((a, b) => {
          const dateTimeA = new Date(`${a.data}T${a.ora}`).getTime();
          const dateTimeB = new Date(`${b.data}T${b.ora}`).getTime();
          return dateTimeB - dateTimeA; // Ordine decrescente (Newest first)
        })
        .slice(0, 3);

      // 2. Prossima prenotazione CONFERMATA più vicina (futura)
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);

      const futureConfermate = tutte
        .filter(p => p.stato === 'confermata' && new Date(p.data) >= oggi)
        .sort((a, b) => {
          const dateTimeA = new Date(`${a.data}T${a.ora}`).getTime();
          const dateTimeB = new Date(`${b.data}T${b.ora}`).getTime();
          return dateTimeA - dateTimeB; // Ordine crescente per trovare la più vicina
        });

      this.prossimoRicevimento = futureConfermate.length > 0 ? futureConfermate[0] : null;

    } catch (err) {
      console.error('Errore caricamento dati dashboard', err);
    }
  }
}