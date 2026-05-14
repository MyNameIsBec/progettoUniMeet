import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonIcon,
  IonCard,
  IonCardContent,
  IonButton,
} from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { VoceMenuNavigazione } from '../../../core/models/interfacce';
import { AdminService, AdminStats } from 'src/app/core/services/admin';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.page.html',
  styleUrls: ['./dashboard-admin.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonCard,
    IonCardContent,
    IonButton,
    CommonModule,
    FormsModule,
    RouterLink,
    DashboardLayoutComponent,
  ],
})
export class DashboardAdminPage implements OnInit {
  stats: AdminStats = {
    totaleStudenti: 0,
    totaleDocenti: 0,
    totalePrenotazioni: 0,
    slotAttivi: 0,
    prenotazioniOggi: 0,
  };

  oggi = new Date().toISOString().slice(0, 10);

  vociMenuAdmin: VoceMenuNavigazione[] = [
    { etichetta: 'Dashboard', percorso: '/dashboard-admin', icona: 'stats-chart-outline', esatto: true },
    { etichetta: 'Utenti', percorso: '/gestione-utenti-admin', icona: 'people-outline' },
    { etichetta: 'Slot', percorso: '/gestione-slot-admin', icona: 'calendar-outline' },
    { etichetta: 'Calendario', percorso: '/gestione-calendario', icona: 'calendar-outline' },
    { etichetta: 'Segnalazioni', percorso: '/gestione-segnalazioni', icona: 'flag-outline' },
  ];

  constructor(private admin: AdminService) { }

  ngOnInit() {
    this.admin.getStatistiche().subscribe((data) => {
      this.stats = data;
    });
  }
}
