import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonSegment, IonSegmentButton,
  IonLabel, IonIcon, IonSelect, IonSelectOption,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  timeOutline, schoolOutline, calendarOutline, locationOutline,
  checkmarkCircle, closeCircle, hourglass, peopleOutline,
} from 'ionicons/icons';
import { Admin, SlotGriglia, UtenteUnificato, FiltriSlot } from 'src/app/core/services/admin';

@Component({
  selector: 'app-gestione-slot-admin',
  templateUrl: './gestione-slot-admin.page.html',
  styleUrls: ['./gestione-slot-admin.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonSegment, IonSegmentButton,
    IonLabel, IonIcon, IonSelect, IonSelectOption,
    CommonModule, FormsModule, RouterLink,
  ],
})
export class GestioneSlotAdminPage implements OnInit {
  activeSegment = 'slot';
  slot: SlotGriglia[] = [];
  docenti: UtenteUnificato[] = [];
  inCaricamento = false;

  filtroDocenteId = '';
  filtroData = '';
  filtroStato = '';

  constructor(private admin: Admin) {
    addIcons({
      timeOutline, schoolOutline, calendarOutline, locationOutline,
      checkmarkCircle, closeCircle, hourglass, peopleOutline,
    });
  }

  ngOnInit() {
    this.caricaDocenti();
    this.caricaSlot();
  }

  caricaDocenti() {
    this.admin.getUtenti('docente').subscribe({
      next: (data) => this.docenti = data,
    });
  }

  caricaSlot() {
    this.inCaricamento = true;
    const filtri: FiltriSlot = {};
    if (this.filtroDocenteId) filtri.docenteId = this.filtroDocenteId;
    if (this.filtroData) filtri.data = this.filtroData;
    if (this.filtroStato && this.filtroStato !== 'tutti') filtri.stato = this.filtroStato;

    this.admin.getSlotGlobali(filtri).subscribe({
      next: (data) => {
        this.slot = data;
        this.inCaricamento = false;
      },
      error: () => this.inCaricamento = false,
    });
  }

  statoLabel(disponibile: boolean): string {
    return disponibile ? 'Libero' : 'Occupato';
  }

  statoIcona(disponibile: boolean): string {
    return disponibile ? 'checkmark-circle' : 'close-circle';
  }

  statoClasse(disponibile: boolean): string {
    return disponibile ? 'stato-libero' : 'stato-occupato';
  }
}
