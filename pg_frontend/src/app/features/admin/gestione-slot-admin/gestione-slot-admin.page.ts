import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonIcon, IonButton, IonSelect, IonSelectOption,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent,
} from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AdminService, SlotGriglia, SlotDate, FiltriSlot, CreaSlotRequest } from 'src/app/core/services/admin';

@Component({
  selector: 'app-gestione-slot-admin',
  templateUrl: './gestione-slot-admin.page.html',
  styleUrls: ['./gestione-slot-admin.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonButton, IonSelect, IonSelectOption,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent,
    CommonModule, FormsModule, DashboardLayoutComponent,
  ],
})
export class GestioneSlotAdminPage implements OnInit {
  slot: SlotGriglia[] = [];
  docenti: any[] = [];
  docentiCaricati = false;
  dateDisponibili: SlotDate[] = [];
  filtroDocenteId = '';
  filtroData = '';
  filtroStato = '';
  inCaricamento = false;

  mostraModale = false;
  modaleTitolo = '';
  slotInModifica: SlotGriglia | null = null;
  formDati: any = {};

  constructor(private admin: AdminService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    if (params['stato']) this.filtroStato = params['stato'];
    if (params['data']) this.filtroData = params['data'];
    this.caricaDocenti();
    this.caricaDate();
    this.caricaSlot();
  }

  formVuoto(): CreaSlotRequest {
    return {
      docenteId: '',
      data: '',
      oraInizio: '',
      oraFine: '',
      disponibilita: true,
      luogo: { nomeAula: '', edificio: '', piano: '' },
    };
  }

  caricaDate() {
    this.admin.getSlotDate().subscribe({
      next: (data) => this.dateDisponibili = data,
      error: () => {
        this.dateDisponibili = [];
      },
    });
  }

  formattaData(data: string): string {
    const d = new Date(data + 'T00:00:00');
    return d.toLocaleDateString('it-IT', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  caricaDocenti() {
    this.docentiCaricati = false;
    this.admin.getUtenti('docente').subscribe({
      next: (data) => {
        this.docenti = data;
        this.docentiCaricati = true;
      },
      error: () => {
        this.docenti = [];
        this.docentiCaricati = true;
      },
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

  apriModaleCrea() {
    this.modaleTitolo = 'Crea slot';
    this.slotInModifica = null;
    this.formDati = this.formVuoto();
    this.mostraModale = true;
    this.cdr.detectChanges();
  }

  apriModaleModifica(s: SlotGriglia) {
    this.modaleTitolo = 'Modifica slot';
    this.slotInModifica = s;
    this.formDati = {
      docenteId: s.docente.id,
      data: s.data,
      oraInizio: s.oraInizio,
      oraFine: s.oraFine,
      disponibilita: s.disponibilita,
      luogo: s.luogo ? { ...s.luogo } : { nomeAula: '', edificio: '', piano: '' },
    };
    this.mostraModale = true;
    this.cdr.detectChanges();
  }

  chiudiModale() {
    this.mostraModale = false;
  }

  salvaSlot() {
    const dati: any = {
      data: this.formDati.data,
      oraInizio: this.formDati.oraInizio,
      oraFine: this.formDati.oraFine,
      disponibilita: this.formDati.disponibilita,
      docenteId: this.formDati.docenteId,
    };

    const l = this.formDati.luogo;
    if (l?.nomeAula?.trim() || l?.edificio?.trim() || l?.piano?.trim()) {
      dati.luogo = l;
    }

    if (this.slotInModifica) {
      this.admin.modificaSlot(this.slotInModifica.id, dati).subscribe({
        next: () => {
          this.chiudiModale();
          this.caricaSlot();
          this.caricaDate();
        },
      });
    } else {
      this.admin.creaSlot(dati).subscribe({
        next: () => {
          this.chiudiModale();
          this.caricaSlot();
          this.caricaDate();
        },
      });
    }
  }

  confermaEliminazione(s: SlotGriglia) {
    const msg = `Eliminare lo slot del ${s.data} (${s.oraInizio}-${s.oraFine}) di ${s.docente.nome} ${s.docente.cognome}?`;
    if (confirm(msg)) {
      this.admin.eliminaSlot(s.id).subscribe({
        next: () => {
          this.caricaSlot();
          this.caricaDate();
        },
      });
    }
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
