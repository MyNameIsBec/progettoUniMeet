import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-dettaglio-prenotazione',
  templateUrl: './dettaglio-prenotazione.page.html',
  styleUrls: ['./dettaglio-prenotazione.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DettaglioPrenotazionePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
