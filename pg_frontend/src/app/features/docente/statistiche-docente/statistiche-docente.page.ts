import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-statistiche-docente',
  templateUrl: './statistiche-docente.page.html',
  styleUrls: ['./statistiche-docente.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class StatisticheDocentePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
