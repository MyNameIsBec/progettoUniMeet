import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-profilo-studente',
  templateUrl: './profilo-studente.page.html',
  styleUrls: ['./profilo-studente.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProfiloStudentePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
