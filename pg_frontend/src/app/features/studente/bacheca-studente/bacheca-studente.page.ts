import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  helpCircleOutline,
  chevronForwardOutline,
  chatbubbleEllipsesOutline,
  informationCircleOutline,
  calendarClearOutline,
  linkOutline,
  schoolOutline,
  libraryOutline,
  bookOutline,
  openOutline
} from 'ionicons/icons';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { FAQ, LinkUtile } from '../../../core/models/interfacce';

@Component({
  selector: 'app-bacheca-studente',
  templateUrl: './bacheca-studente.page.html',
  styleUrls: ['./bacheca-studente.page.scss'],
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
    DashboardLayoutComponent
  ]
})
export class BachecaStudentePage {

  public listaFaq: FAQ[] = [
    {
      id: 1,
      domanda: 'Come posso prenotare un ricevimento?',
      risposta: 'Per prenotare un ricevimento vai nella sezione Prenota, scegli il docente, seleziona uno slot disponibile e conferma la richiesta.',
      aperta: true
    },
    {
      id: 2,
      domanda: 'Posso annullare una prenotazione?',
      risposta: 'Sì, puoi annullare una prenotazione direttamente dalla tua dashboard o dalla sezione "Le mie prenotazioni" cliccando sul pulsante "Annulla".',
      aperta: false
    }
  ];

  public collegamentiUtili: LinkUtile[] = [
    {
      id: 1,
      titolo: 'Sito ufficiale UniMeet',
      descrizione: 'Portale ufficiale per tutte le comunicazioni universitarie.',
      icona: 'school-outline',
      colore: 'blue',
      url: '#'
    },
    {
      id: 2,
      titolo: 'Materiale Didattico',
      descrizione: 'Accedi alle slide e ai documenti caricati dai docenti.',
      icona: 'library-outline',
      colore: 'green',
      url: '#'
    }
  ];

  constructor() {
    addIcons({
      helpCircleOutline,
      chevronForwardOutline,
      chatbubbleEllipsesOutline,
      informationCircleOutline,
      calendarClearOutline,
      linkOutline,
      schoolOutline,
      libraryOutline,
      bookOutline,
      openOutline
    });
  }

  public invertiStatoFaq(faq: FAQ): void {
    faq.aperta = !faq.aperta;
  }
}