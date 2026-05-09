import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-riepilogo-prenotazioni',
  templateUrl: './riepilogo-prenotazioni.page.html',
  styleUrls: ['./riepilogo-prenotazioni.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RiepilogoPrenotazioniPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
