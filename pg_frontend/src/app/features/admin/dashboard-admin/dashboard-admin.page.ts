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
  IonIcon,
  IonLabel,
  IonCard,
  IonCardContent,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  schoolOutline,
  personOutline,
  calendarOutline,
  timeOutline,
  calendarNumberOutline,
  personAddOutline,
  settingsOutline,
} from 'ionicons/icons';
import { Admin, AdminStats } from 'src/app/core/services/admin';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.page.html',
  styleUrls: ['./dashboard-admin.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    IonIcon,
    IonLabel,
    IonCard,
    IonCardContent,
    IonButton,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
})
export class DashboardAdminPage implements OnInit {
  activeSegment = 'dashboard';
  stats: AdminStats = {
    totaleStudenti: 0,
    totaleDocenti: 0,
    totalePrenotazioni: 0,
    slotAttivi: 0,
    prenotazioniOggi: 0,
  };

  constructor(private admin: Admin) {
    addIcons({
      schoolOutline,
      personOutline,
      calendarOutline,
      timeOutline,
      calendarNumberOutline,
      personAddOutline,
      settingsOutline,
    });
  }

  ngOnInit() {
    this.admin.getStatistiche().subscribe((data) => {
      this.stats = data;
    });
  }
}
