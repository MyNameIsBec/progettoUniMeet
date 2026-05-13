import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonCard, IonCardContent, IonButton, IonBadge, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { Prenotazione } from 'src/app/core/models/interfacce';
import { AuthService } from '../../../core/services/auth';
import { StudenteService } from '../../../core/services/studente';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { firstValueFrom } from 'rxjs';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-riepilogo-prenotazioni',
  templateUrl: './riepilogo-prenotazioni.page.html',
  styleUrls: ['./riepilogo-prenotazioni.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonCard, IonCardContent, IonButton, IonBadge, IonSelect, IonSelectOption, DashboardLayoutComponent]
})
export class RiepilogoPrenotazioniPage implements OnInit {
  public listaPrenotazioni: Prenotazione[] = [];
  public prenotazioniOriginali: Prenotazione[] = []; // Backup per il filtraggio

  public ricerca: string = '';
  public statoSelezionato: string = 'tutti';

  constructor(private authService: AuthService, private prenotazioneService: PrenotazioneService, private studenteService: StudenteService) {
  }

  async ngOnInit() {
    try {
      const user = this.authService.getCurrentUser();
      if (user != null) {
        this.prenotazioniOriginali = await firstValueFrom(this.prenotazioneService.getPrenotazioniStudente(user.id));
        this.listaPrenotazioni = [...this.prenotazioniOriginali];
      }
    }
    catch (error) {
      console.error('Errore durante il caricamento delle prenotazioni', error);
    }
  }

  cerca() {
    this.applicaFiltri();
  }

  onFilterStato(event: any) {
    this.statoSelezionato = event.detail.value;
    this.applicaFiltri();
  }

  applicaFiltri() {
    this.listaPrenotazioni = this.prenotazioniOriginali.filter(p => {
      const matchRicerca = !this.ricerca ||
        p.docente.toLowerCase().includes(this.ricerca.toLowerCase()) ||
        p.materia.toLowerCase().includes(this.ricerca.toLowerCase());

      const matchStato = this.statoSelezionato === 'tutti' || p.stato === this.statoSelezionato;

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
