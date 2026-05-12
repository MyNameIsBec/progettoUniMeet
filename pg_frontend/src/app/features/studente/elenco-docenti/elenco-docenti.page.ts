import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  mailOutline,
  businessOutline,
  informationCircleOutline,
  checkmarkOutline,
  calendarOutline,
  calendarClearOutline,
  personOutline
} from 'ionicons/icons';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { Docente } from '../../../core/models/interfacce';

@Component({
  selector: 'app-elenco-docenti',
  templateUrl: './elenco-docenti.page.html',
  styleUrls: ['./elenco-docenti.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonSelect,
    IonSelectOption,
    DashboardLayoutComponent
  ]
})
export class ElencoDocentiPage {
  public listaDocenti: Docente[] = [
    {
      id: 1,
      nome: 'Prof. Stefano Bernardi',
      materia: 'Analisi Matematica I',
      email: 's.bernardi@unimeet.it',
      ufficio: 'Edificio A, Aula 201',
      iniziali: 'SB',
      coloreAvatar: 'blue',
      prossimoSlot: '23/05/2026 · 10:00',
      disponibile: true,
      descrizione: 'Docente esperto in modellazione matematica.'
    },
    {
      id: 2,
      nome: 'Prof.ssa Elisa Esposito',
      materia: 'Diritto Privato',
      email: 'e.esposito@unimeet.it',
      ufficio: 'Edificio B, Studio 15',
      iniziali: 'EE',
      coloreAvatar: 'purple',
      prossimoSlot: '22/05/2026 · 14:30',
      disponibile: true,
      descrizione: 'Disponibile per ricevimento tesi.'
    }
  ];

  constructor() {
    addIcons({
      searchOutline,
      mailOutline,
      businessOutline,
      informationCircleOutline,
      checkmarkOutline,
      calendarOutline,
      calendarClearOutline,
      personOutline
    });
  }
}