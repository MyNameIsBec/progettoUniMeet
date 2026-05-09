import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-form-prenotazione',
  templateUrl: './form-prenotazione.page.html',
  styleUrls: ['./form-prenotazione.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class FormPrenotazionePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
