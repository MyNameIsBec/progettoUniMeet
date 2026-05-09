import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-bacheca-studente',
  templateUrl: './bacheca-studente.page.html',
  styleUrls: ['./bacheca-studente.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class BachecaStudentePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
