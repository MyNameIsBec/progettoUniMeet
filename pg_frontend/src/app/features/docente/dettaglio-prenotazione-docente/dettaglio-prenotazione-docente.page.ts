import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-dettaglio-prenotazione-docente',
  templateUrl: './dettaglio-prenotazione-docente.page.html',
  styleUrls: ['./dettaglio-prenotazione-docente.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DettaglioPrenotazioneDocentePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
