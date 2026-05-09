import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-segnalazione',
  templateUrl: './segnalazione.page.html',
  styleUrls: ['./segnalazione.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SegnalazionePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
