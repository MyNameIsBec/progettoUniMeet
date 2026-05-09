import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestione-slot-admin',
  templateUrl: './gestione-slot-admin.page.html',
  styleUrls: ['./gestione-slot-admin.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GestioneSlotAdminPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
