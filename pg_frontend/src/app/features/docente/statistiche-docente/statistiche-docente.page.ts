import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../core/services/auth';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { DocenteService } from '../../../core/services/docente';

@Component({
  selector: 'app-statistiche-docente',
  templateUrl: './statistiche-docente.page.html',
  styleUrls: ['./statistiche-docente.page.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, DashboardLayoutComponent ]})
export class StatisticheDocentePage implements OnInit {
  loading = true;
  totalePrenotazioni = 0;
  confermate = 0;
  inAttesa = 0;
  annullate = 0;
  argomenti: { nome: string; conteggio: number; percentuale: number }[] = [];

  constructor(
    private authService: AuthService,
    private prenotazioneService: PrenotazioneService,
    private docenteService: DocenteService
  ) {}

  async ngOnInit() {
    await this.caricaStatistiche();
  }

  async caricaStatistiche() {
    this.loading = true;
    try {
      const user = this.authService.getCurrentUser();
      if (!user) return;
      const prenotazioni = await firstValueFrom(this.prenotazioneService.getPrenotazioniDocente(user.id)) as any[];
      this.totalePrenotazioni = prenotazioni.length;
      this.confermate = prenotazioni.filter(p => p.stato === 'confermata' || p.stato === 'completata').length;
      this.inAttesa = prenotazioni.filter(p => p.stato === 'in_attesa').length;
      this.annullate = prenotazioni.filter(p => p.stato === 'annullata').length;

      const stats = await firstValueFrom(this.docenteService.getStatistiche(user.id));
      if (stats?.argomenti) {
        const totale = stats.argomenti.reduce((s: number, a: any) => s + a.conteggio, 0);
        this.argomenti = stats.argomenti.map((a: any) => ({
          nome: a.nome,
          conteggio: a.conteggio,
          percentuale: totale > 0 ? Math.round((a.conteggio / totale) * 100) : 0
        })).sort((a: any, b: any) => b.conteggio - a.conteggio);
      }
    } catch (err) {
      console.error('Errore caricamento statistiche', err);
    }
    this.loading = false;
  }
}
