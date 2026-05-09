import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestione-slot',
  templateUrl: './gestione-slot.page.html',
  styleUrls: ['./gestione-slot.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GestioneSlotPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
