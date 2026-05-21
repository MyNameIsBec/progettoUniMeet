import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-dettaglio-prenotazione-docente',
  templateUrl: './dettaglio-prenotazione-docente.page.html',
  styleUrls: ['./dettaglio-prenotazione-docente.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class DettaglioPrenotazioneDocentePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
