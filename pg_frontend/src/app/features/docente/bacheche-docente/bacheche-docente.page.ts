import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-bacheche-docente',
  templateUrl: './bacheche-docente.page.html',
  styleUrls: ['./bacheche-docente.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class BachecheDocentePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
