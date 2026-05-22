import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom, Subscription } from 'rxjs';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { DocenteService } from '../../../core/services/docente';
import { Prenotazione, SlotRicevimento } from '../../../core/models/interfacce';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-dashboard-docente',
  templateUrl: './dashboard-docente.page.html',
  styleUrls: ['./dashboard-docente.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, DashboardLayoutComponent]
})
export class DashboardDocentePage implements OnInit, OnDestroy {
  public nomeDocente: string = '';
  public idDocenteCorrente: string = '';

  public prenotazioniOggiCount: number = 0;
  public slotDisponibiliCount: number = 0;
  public richiesteInAttesaCount: number = 0;
  public riempimentoMedio: number = 0;

  public prossimiRicevimenti: any[] = [];
  public recentiPrenotazioni: any[] = [];
  public recentiSlots: SlotRicevimento[] = [];
  public argomentiRichiesti: { nome: string; percentuale: string }[] = [];

  private userSub: Subscription | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private prenotazioneService: PrenotazioneService,
    private docenteService: DocenteService
  ) {
  }

  async ngOnInit() {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.nomeDocente = `${user.nome} ${user.cognome}`;
        this.idDocenteCorrente = user.id;
        this.caricaDatiDashboard(user.id);
      }
    });
  }

  ionViewWillEnter() {
    if (this.idDocenteCorrente) {
      this.caricaDatiDashboard(this.idDocenteCorrente);
    }
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  async caricaDatiDashboard(idDocente: string) {
    try {
      const tuttePrenotazioni = await firstValueFrom(this.prenotazioneService.getPrenotazioniDocente(idDocente)) as any[];

      const oggiStr = this.getLocalOggiStr();
      this.prenotazioniOggiCount = tuttePrenotazioni.filter(p => p.data === oggiStr && p.stato !== 'annullata' && p.stato !== 'annullato').length;
      this.richiesteInAttesaCount = tuttePrenotazioni.filter(p => p.stato === 'in_attesa').length;
      this.prossimiRicevimenti = tuttePrenotazioni.filter(p => p.stato === 'confermata' || p.stato === 'in_attesa').sort((a, b) => {
        const timeA = new Date(`${a.data}T${a.oraInizio || '00:00'}`).getTime();
        const timeB = new Date(`${b.data}T${b.oraInizio || '00:00'}`).getTime();
        return timeA - timeB;
      }).slice(0, 3);

      this.recentiPrenotazioni = tuttePrenotazioni.sort((a, b) => {
        const timeA = new Date(`${a.data}T${a.oraInizio || '00:00'}`).getTime();
        const timeB = new Date(`${b.data}T${b.oraInizio || '00:00'}`).getTime();
        return timeB - timeA;
      }).slice(0, 3);

      const tuttiSlots = await firstValueFrom(this.docenteService.getSlots(idDocente));
      this.slotDisponibiliCount = tuttiSlots.filter(s => s.disponibilita).length;

      const totalSlots = tuttiSlots.length;
      const occupatiSlots = tuttiSlots.filter(s => !s.disponibilita).length;
      this.riempimentoMedio = totalSlots > 0 ? Math.round((occupatiSlots / totalSlots) * 100) : 0;

      this.recentiSlots = tuttiSlots.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()).slice(0, 3);

      const stats = await firstValueFrom(this.docenteService.getStatistiche(idDocente));
      if (stats && stats.argomenti) {
        const totaleArgomenti = stats.argomenti.reduce((sum: number, a: any) => sum + a.conteggio, 0);
        this.argomentiRichiesti = stats.argomenti.map((a: any) => {
          const percento = totaleArgomenti > 0 ? Math.round((a.conteggio / totaleArgomenti) * 100) : 0;
          return {
            nome: a.nome,
            percentuale: `${percento}%`
          };
        }).sort((a: any, b: any) => parseInt(b.percentuale) - parseInt(a.percentuale)).slice(0, 3);
      }


    } catch (err) {
      console.error('Errore caricamento dati dashboard docente', err);
    }
  }

  getLocalOggiStr(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async confermaPrenotazione(id: string) {
    try {
      await firstValueFrom(this.prenotazioneService.aggiornaStatoPrenotazione(id, 'confermata'));
      if (this.idDocenteCorrente) {
        await this.caricaDatiDashboard(this.idDocenteCorrente);
      }
    } catch (err) {
      console.error('Errore conferma prenotazione', err);
    }
  }

  formattaData(dataInput: string | Date | any): string {
    if (!dataInput) return '';
    let dataStr = '';
    if (dataInput instanceof Date) {
      const year = dataInput.getFullYear();
      const month = String(dataInput.getMonth() + 1).padStart(2, '0');
      const day = String(dataInput.getDate()).padStart(2, '0');
      dataStr = `${year}-${month}-${day}`;
    } else {
      dataStr = String(dataInput);
    }
    const parti = dataStr.split('-');
    if (parti.length !== 3) return dataStr;
    return `${parti[2]}/${parti[1]}/${parti[0]}`;
  }

  getGiornoSettimana(dataInput: string | Date | any): string {
    if (!dataInput) return '';
    const date = dataInput instanceof Date ? dataInput : new Date(dataInput);
    const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    return giorni[date.getDay()] || '';
  }

  getIniziali(nomeCognome: string): string {
    if (!nomeCognome) return '??';
    const parti = nomeCognome.trim().split(/\s+/);
    if (parti.length >= 2) {
      return `${parti[0]![0]}${parti[1]![0]}`.toUpperCase();
    }
    return (parti[0] ? parti[0][0] : '?').toUpperCase();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}