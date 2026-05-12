import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonCard, IonCardContent, IonButton, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, 
  timeOutline, 
  locationOutline, 
  personOutline, 
  chevronForwardOutline,
  calendarClearOutline,
  filterOutline
} from 'ionicons/icons';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-riepilogo-prenotazioni',
  templateUrl: './riepilogo-prenotazioni.page.html',
  styleUrls: ['./riepilogo-prenotazioni.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonCard, IonCardContent, IonButton, IonBadge, DashboardLayoutComponent]
})
export class RiepilogoPrenotazioniPage implements OnInit {
  prenotazioni = [
    {
      id: 1,
      docente: 'Prof. Mario Rossi',
      materia: 'Analisi Matematica I',
      data: '23/05/2025',
      ora: '10:00',
      aula: 'Aula 201, Edificio A',
      stato: 'confermata',
      statoColor: 'success'
    },
    {
      id: 2,
      docente: 'Prof.ssa Laura Bianchi',
      materia: 'Diritto Privato',
      data: '25/05/2025',
      ora: '15:30',
      aula: 'Studio 15, Edificio B',
      stato: 'in attesa',
      statoColor: 'warning'
    }
  ];

  constructor() {
    addIcons({
      calendarOutline,
      timeOutline,
      locationOutline,
      personOutline,
      chevronForwardOutline,
      calendarClearOutline,
      filterOutline
    });
  }

  ngOnInit() {}
}
