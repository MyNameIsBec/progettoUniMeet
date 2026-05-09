import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-profilo-docente',
  templateUrl: './profilo-docente.page.html',
  styleUrls: ['./profilo-docente.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProfiloDocentePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
