import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';
import { 
  IonCard, IonCardHeader, IonCardTitle, 
  IonCardSubtitle, IonCardContent, IonItem, IonLabel, 
  IonIcon, IonButton, IonBadge, IonList, IonSpinner 
} from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';

/**
 * Pagina di dettaglio per una singola prenotazione.
 * Mostra tutte le informazioni relative all'appuntamento e consente la cancellazione.
 */

@Component({
  selector: 'app-dettaglio-prenotazione',
  templateUrl: './dettaglio-prenotazione.page.html',
  styleUrls: ['./dettaglio-prenotazione.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonIcon, 
    IonCard, 
    IonCardContent, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardSubtitle,
    IonButton, 
    IonBadge,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
    DashboardLayoutComponent,
    RouterLink
  ]
})
export class DettaglioPrenotazionePage implements OnInit {
  
  booking: any = null;
  isLoading = true;

  constructor(private route: ActivatedRoute) {
    // Caricamento icone necessarie
    addIcons({
      person: icons.personOutline,
      book: icons.bookOutline,
      calendar: icons.calendarOutline,
      time: icons.timeOutline,
      location: icons.locationOutline,
      chat: icons.chatbubbleEllipsesOutline,
      alert: icons.alertCircleOutline,
      check: icons.checkmarkCircleOutline,
      close: icons.closeCircleOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.fetchBookingData(id);
  }

  /**
   * Recupera i dati della prenotazione (attualmente simulato con mock data)
   */
  private fetchBookingData(id: string | null) {
    this.isLoading = true;
    
    // Simuliamo un ritardo di caricamento per rendere la UI più "vera"
    setTimeout(() => {
      this.booking = {
        id: id || '999',
        docente: 'Mario Rossi',
        materia: 'Programmazione I',
        data: new Date(2026, 4, 15),
        oraInizio: '10:00',
        oraFine: '10:30',
        ufficio: 'Aula B1',
        stato: 'confermato',
        noteStudente: 'Buongiorno, vorrei chiarimenti sull\'ultimo esercizio visto a lezione.',
        dataRichiesta: new Date(2026, 4, 10)
      };
      this.isLoading = false;
    }, 600);
  }

  /**
   * Ritorna il colore associato allo stato della prenotazione
   */
  getStatusColor(status: string): string {
    const colors: {[key: string]: string} = {
      'confermato': 'success',
      'in_attesa': 'warning',
      'cancellato': 'danger'
    };
    return colors[status] || 'medium';
  }

  /**
   * Gestisce l'azione di cancellazione dell'appuntamento
   */
  async annullaPrenotazione() {
    console.log('Annullamento prenotazione:', this.booking.id);
    // Qui andrebbe la logica di chiamata al backend
  }
}
