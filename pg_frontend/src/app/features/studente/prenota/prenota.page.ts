import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';
import { 
  IonItem, 
  IonSelect, 
  IonSelectOption, 
  IonButton, 
  IonIcon, 
  IonCard, 
  IonCardContent, 
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonTextarea
} from '@ionic/angular/standalone';
import { SlotRicevimento } from '../../../core/models/interfacce';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-prenota',
  templateUrl: './prenota.page.html',
  styleUrls: ['./prenota.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonItem, 
    IonSelect, 
    IonSelectOption, 
    IonButton, 
    IonIcon, 
    IonCard, 
    IonCardContent, 
    IonCardHeader,
    IonCardTitle,
    IonInput,
    IonTextarea,
    DashboardLayoutComponent
  ]
})
export class PrenotaPage implements OnInit {

  modalitaVisualizzazione: 'calendario' | 'lista' = 'calendario';
  dataSelezionata: Date = new Date();

  filtriRicerca = {
    testo: '',
    materia: 'tutte',
    docente: 'tutti'
  };

  elencoMaterie = ['Programmazione I', 'Basi di Dati', 'Analisi Matematica', 'Reti di Calcolatori'];
  elencoDocenti = [
    { id: '1', nome: 'Stefano Bernardi' },
    { id: '2', nome: 'Elisa Esposito' },
    { id: '3', nome: 'Marco Galli' },
    { id: '4', nome: 'Valentina Rizzo' }
  ];

  tuttiGliSlot: SlotRicevimento[] = [
    {
      id: '1',
      docenteId: '1',
      materia: 'Analisi Matematica I',
      data: new Date(2026, 4, 15, 10, 0),
      oraInizio: '10:00',
      oraFine: '10:30',
      stato: 'disponibile',
      luogo: {
        id: '1',
        aula: 'Aula 201',
        edificio: 'Edificio A',
        piano: 2,
        latitudine: 0,
        longitudine: 0
      }
    }
  ];

  slotFiltrati: SlotRicevimento[] = [];

  constructor(private router: Router) {
    addIcons({
      calendarOutline: icons.calendarOutline,
      filterOutline: icons.filterOutline,
      searchOutline: icons.searchOutline,
      personCircleOutline: icons.personCircleOutline,
      bookOutline: icons.bookOutline,
      timeOutline: icons.timeOutline,
      lockClosedOutline: icons.lockClosedOutline,
      locationOutline: icons.locationOutline,
      businessOutline: icons.businessOutline,
      mailOutline: icons.mailOutline,
      chevronBackOutline: icons.chevronBackOutline,
      chevronForwardOutline: icons.chevronForwardOutline,
      informationCircleOutline: icons.informationCircleOutline,
      personOutline: icons.personOutline,
      hourglassOutline: icons.hourglassOutline,
      attachOutline: icons.attachOutline,
      calendarClearOutline: icons.calendarClearOutline
    });
  }

  ngOnInit() {
    this.applicaFiltri();
  }

  applicaFiltri() {
    this.slotFiltrati = this.tuttiGliSlot.filter(slot => {
      const testoCercato = this.filtriRicerca.testo.toLowerCase();
      const nomeDocente = this.ottieniNomeDocente(slot.docenteId);
      const corrispondeRicerca = !testoCercato || nomeDocente.toLowerCase().includes(testoCercato) || slot.materia.toLowerCase().includes(testoCercato);
      const corrispondeMateria = this.filtriRicerca.materia === 'tutte' || slot.materia === this.filtriRicerca.materia;
      const corrispondeDocente = this.filtriRicerca.docente === 'tutti' || String(slot.docenteId) === String(this.filtriRicerca.docente);
      let corrispondeData = true;
      if (this.modalitaVisualizzazione === 'calendario') {
        corrispondeData = slot.data.toDateString() === this.dataSelezionata.toDateString();
      }
      return corrispondeRicerca && corrispondeMateria && corrispondeDocente && corrispondeData;
    });
  }

  ottieniNomeDocente(id: string | number): string {
    const docente = this.elencoDocenti.find(d => String(d.id) === String(id));
    return docente ? docente.nome : 'Docente Sconosciuto';
  }

  quandoDataSelezionata(evento: any) {
    this.dataSelezionata = new Date(evento.detail.value);
    this.applicaFiltri();
  }

  async prenota(slot: SlotRicevimento) {
    console.log('Prenotazione confermata per:', slot);
  }
}
