import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-gestione-slot-admin',
  templateUrl: './gestione-slot-admin.page.html',
  styleUrls: ['./gestione-slot-admin.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
})
export class GestioneSlotAdminPage implements OnInit {
  activeSegment = 'slot';

  constructor() {
    addIcons({ timeOutline });
  }

  ngOnInit() {}
}
