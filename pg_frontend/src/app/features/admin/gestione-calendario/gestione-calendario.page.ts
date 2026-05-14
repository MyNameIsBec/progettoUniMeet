import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonIcon, IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent,
  IonItem, IonLabel, IonInput, IonDatetime,
} from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { VoceMenuNavigazione } from '../../../core/models/interfacce';
import { AdminService, GiornoBloccato } from 'src/app/core/services/admin';

@Component({
  selector: 'app-gestione-calendario',
  templateUrl: './gestione-calendario.page.html',
  styleUrls: ['./gestione-calendario.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent,
    IonItem, IonLabel, IonInput, IonDatetime,
    CommonModule, FormsModule, DashboardLayoutComponent,
  ],
})
export class GestioneCalendarioPage implements OnInit {
  giorniBloccati: GiornoBloccato[] = [];
  inCaricamento = false;

  mostraModale = false;
  formData = '';
  formMotivo = '';

  vociMenuAdmin: VoceMenuNavigazione[] = [
    { etichetta: 'Dashboard', percorso: '/dashboard-admin', icona: 'stats-chart-outline', esatto: true },
    { etichetta: 'Utenti', percorso: '/gestione-utenti-admin', icona: 'people-outline' },
    { etichetta: 'Slot', percorso: '/gestione-slot-admin', icona: 'calendar-outline' },
    { etichetta: 'Calendario', percorso: '/gestione-calendario', icona: 'calendar-outline' },
    { etichetta: 'Segnalazioni', percorso: '/gestione-segnalazioni', icona: 'flag-outline' },
  ];

  constructor(private admin: AdminService) { }

  ngOnInit() {
    this.caricaGiorni();
  }

  caricaGiorni() {
    this.inCaricamento = true;
    this.admin.getGiorniBloccati().subscribe({
      next: (data) => {
        this.giorniBloccati = data;
        this.inCaricamento = false;
      },
      error: () => this.inCaricamento = false,
    });
  }

  formattaData(data: string): string {
    const dataPulita = data.split('T')[0];
    const d = new Date(dataPulita + 'T12:00:00');
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  apriModale() {
    this.formData = '';
    this.formMotivo = '';
    this.mostraModale = true;
  }

  chiudiModale() {
    this.mostraModale = false;
  }

  salvaGiorno() {
    if (!this.formData) return;
    const data = this.formData.split('T')[0] || this.formData;
    this.admin.bloccaGiorno({ data, motivo: this.formMotivo || undefined }).subscribe({
      next: () => {
        this.chiudiModale();
        this.caricaGiorni();
      },
    });
  }

  confermaSblocca(g: GiornoBloccato) {
    const msg = `Sbloccare il giorno ${this.formattaData(g.data)}?`;
    if (confirm(msg)) {
      this.admin.sbloccaGiorno(g.id).subscribe({
        next: () => this.caricaGiorni(),
      });
    }
  }
}
