import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton} from '@ionic/angular/standalone';
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

  annullaPrenotazione(id: string) {
    this.prenotazioneService.annullaPrenotazione(id).subscribe({
      next: () => this.caricaDatiDashboard(this.idStudenteCorrente),
      error: (err) => console.error('Errore annullamento prenotazione', err)
    });
  }

  get prenotazioniFutureCount(): number {
    return this.totaleConfermate;
  }

  private async caricaDatiDashboard(matricola: string) {
    try {
      // Recupera il profilo completo per conoscere il corso di studi
      const profilo = await firstValueFrom(this.studenteService.getProfilo(matricola));
      
      if (profilo.corsoDiStudiId) {
        const bacheche = await firstValueFrom(this.bachecaService.getBachecaPerCorsoDiStudi(profilo.corsoDiStudiId));
        const tutteFaq: FAQ[] = [];
        for (const b of bacheche) {
          if (b.faqs) tutteFaq.push(...b.faqs);
        }
        this.listaFaq = tutteFaq;
      }

      const tutte = await firstValueFrom(this.prenotazioneService.getPrenotazioniStudente(matricola));
      const adesso = new Date();

      const future = tutte.filter(p => {
        if (p.stato !== 'confermata' && p.stato !== 'in_attesa') return false;
        const dataOra = new Date(`${p.data}T${p.ora}`);
        return dataOra > adesso;
      }).sort((a, b) => {
        const cmp = a.data.localeCompare(b.data);
        if (cmp !== 0) return cmp;
        return (a.ora || '').localeCompare(b.ora || '');
      });

      this.totaleConfermate = future.filter(p => p.stato === 'confermata').length;
      this.listaPrenotazioni = future.slice(0, 3);
      this.prossimoRicevimento = future.find(p => p.stato === 'confermata') ?? null;

    } catch (err) {
      console.error('Errore caricamento dati dashboard', err);
    }
  }
}