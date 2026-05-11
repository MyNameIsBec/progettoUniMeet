import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonBackButton, IonSearchbar, IonItem, IonLabel, IonList,
  IonSelect, IonSelectOption, IonButton, IonIcon, IonBadge,
  IonCard, IonCardContent, IonGrid, IonRow, IonCol,
  IonSegment, IonSegmentButton, IonDatetime
} from '@ionic/angular/standalone';

/**
 * Pagina per la visualizzazione e prenotazione degli slot di ricevimento.
 * Consente allo studente di filtrare per data, docente e materia.
 */

interface Slot {
  id: string;
  docente: string;
  materia: string;
  data: Date;
  oraInizio: string;
  oraFine: string;
  stato: 'disponibile' | 'prenotato' | 'bloccato';
  ufficio?: string;
}

@Component({
  selector: 'app-prenota',
  templateUrl: './prenota.page.html',
  styleUrls: ['./prenota.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle,
    IonToolbar, IonButtons, IonBackButton, IonSearchbar, IonItem,
    IonLabel, IonList, IonSelect, IonSelectOption, IonButton,
    IonIcon, IonBadge, IonCard, IonCardContent, IonGrid,
    IonRow, IonCol, IonSegment, IonSegmentButton, IonDatetime
  ]
})
export class PrenotaPage implements OnInit {

  // Stato della vista
  viewMode: 'calendar' | 'list' = 'calendar';
  selectedDate: Date = new Date();

  // Filtri attivi
  filters = {
    search: '',
    materia: 'tutte',
    docente: 'tutti'
  };

  // Liste per i filtri (mock data)
  materie = ['Programmazione I', 'Basi di Dati', 'Analisi Matematica', 'Reti di Calcolatori'];
  docenti = ['Mario Rossi', 'Luigi Bianchi', 'Anna Verdi', 'Paola Neri'];

  // Dati degli slot (mock)
  allSlots: Slot[] = [
    {
      id: '1',
      docente: 'Mario Rossi',
      materia: 'Programmazione I',
      data: new Date(2026, 4, 15, 10, 0),
      oraInizio: '10:00',
      oraFine: '10:30',
      stato: 'disponibile',
      ufficio: 'Aula B1'
    },
    {
      id: '2',
      docente: 'Luigi Bianchi',
      materia: 'Basi di Dati',
      data: new Date(2026, 4, 15, 11, 0),
      oraInizio: '11:00',
      oraFine: '11:30',
      stato: 'bloccato',
      ufficio: 'Online (Teams)'
    },
    {
      id: '3',
      docente: 'Anna Verdi',
      materia: 'Analisi Matematica',
      data: new Date(2026, 4, 16, 0, 0),
      oraInizio: '09:00',
      oraFine: '09:30',
      stato: 'disponibile',
      ufficio: 'Studio 4'
    }
  ];

  filteredSlots: Slot[] = [];

  constructor(private router: Router) {
    // Registrazione icone in modo più compatto
    addIcons({
      calendarOutline: icons.calendarOutline,
      filterOutline: icons.filterOutline,
      searchOutline: icons.searchOutline,
      personCircleOutline: icons.personCircleOutline,
      bookOutline: icons.bookOutline,
      timeOutline: icons.timeOutline,
      lockClosedOutline: icons.lockClosedOutline,
      locationOutline: icons.locationOutline
    });
  }

  ngOnInit() {
    this.applyFilters();
  }

  /**
   * Applica i filtri di ricerca, materia e docente alla lista degli slot.
   */
  applyFilters() {
    this.filteredSlots = this.allSlots.filter(slot => {
      const query = this.filters.search.toLowerCase();

      const matchesSearch = !query ||
        slot.docente.toLowerCase().includes(query) ||
        slot.materia.toLowerCase().includes(query);

      const matchesMateria = this.filters.materia === 'tutte' || slot.materia === this.filters.materia;
      const matchesDocente = this.filters.docente === 'tutti' || slot.docente === this.filters.docente;

      // Filtro data: attivo solo se siamo in modalità calendario
      let matchesDate = true;
      if (this.viewMode === 'calendar') {
        matchesDate = slot.data.toDateString() === this.selectedDate.toDateString();
      }

      return matchesSearch && matchesMateria && matchesDocente && matchesDate;
    });
  }

  /**
   * Gestisce il cambio data dal componente ion-datetime
   */
  onDateSelected(event: any) {
    this.selectedDate = new Date(event.detail.value);
    this.applyFilters();
  }

  /**
   * Avvia il processo di prenotazione per uno specifico slot
   */
  async prenota(slot: Slot) {
    if (slot.stato !== 'disponibile') return;

    this.router.navigate(['/dashboard-studente/form-prenotazione'], {
      queryParams: {
        id: slot.id,
        docente: slot.docente,
        materia: slot.materia,
        ora: slot.oraInizio
      }
    });
  }
}
