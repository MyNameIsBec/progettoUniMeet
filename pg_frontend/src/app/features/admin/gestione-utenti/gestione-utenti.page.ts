import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestione-utenti',
  templateUrl: './gestione-utenti.page.html',
  styleUrls: ['./gestione-utenti.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GestioneUtentiPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
