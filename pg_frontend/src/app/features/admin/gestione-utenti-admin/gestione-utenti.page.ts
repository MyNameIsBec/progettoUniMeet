import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonLabel, IonIcon, IonButton, IonSearchbar,
  IonModal, IonInput, IonSelect, IonSelectOption, IonChip,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonContent,
} from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AdminService, UtenteUnificato, CreaUtenteRequest } from 'src/app/core/services/admin';

@Component({
  selector: 'app-gestione-utenti',
  templateUrl: './gestione-utenti.page.html',
  styleUrls: ['./gestione-utenti.page.scss'],
  standalone: true,
  imports: [
    IonLabel, IonIcon, IonButton, IonSearchbar,
    IonModal, IonInput, IonSelect, IonSelectOption, IonChip,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonContent,
    CommonModule, FormsModule, DashboardLayoutComponent,
  ],
})
export class GestioneUtentiPage implements OnInit {
  filtroRuolo = '';
  searchTerm = '';
  utenti: UtenteUnificato[] = [];
  utentiFiltrati: UtenteUnificato[] = [];
  inCaricamento = false;

  mostraModale = false;
  modaleTitolo = '';
  utenteInModifica: UtenteUnificato | null = null;
  formDati: CreaUtenteRequest = this.formVuoto();

  constructor(private admin: AdminService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.caricaUtenti();
    if (this.route.snapshot.queryParams['crea'] === 'true') {
      this.apriModaleCrea();
    }
  }

  formVuoto(): CreaUtenteRequest {
    return { ruolo: 'studente', nome: '', cognome: '', email: '', password: '', corsoDiStudi: '' };
  }

  caricaUtenti(ruolo?: string) {
    this.inCaricamento = true;
    this.admin.getUtenti(ruolo).subscribe({
      next: (data) => {
        this.utenti = data;
        this.applicaFiltro();
        this.inCaricamento = false;
      },
      error: () => this.inCaricamento = false,
    });
  }

  onFiltroRuolo(ruolo: string) {
    this.filtroRuolo = ruolo;
    if (ruolo) {
      this.caricaUtenti(ruolo);
    } else {
      this.caricaUtenti();
    }
  }

  applicaFiltro() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.utentiFiltrati = [...this.utenti];
    } else {
      this.utentiFiltrati = this.utenti.filter(
        (u) =>
          u.nome.toLowerCase().includes(term) ||
          u.cognome.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.matricola && u.matricola.toLowerCase().includes(term))
      );
    }
  }

  onSearchChange(ev: any) {
    this.searchTerm = ev.detail.value ?? '';
    this.applicaFiltro();
  }

  ruoloLabel(ruolo: string): string {
    const map: Record<string, string> = {
      studente: 'Studente', docente: 'Docente', amministratore: 'Admin',
    };
    return map[ruolo] ?? ruolo;
  }

  ruoloIcona(ruolo: string): string {
    const map: Record<string, string> = {
      studente: 'school-outline', docente: 'person-outline', amministratore: 'shield-checkmark-outline',
    };
    return map[ruolo] ?? 'person-outline';
  }

  apriModaleCrea() {
    this.modaleTitolo = 'Crea utente';
    this.utenteInModifica = null;
    this.formDati = this.formVuoto();
    this.mostraModale = true;
  }

  apriModaleModifica(utente: UtenteUnificato) {
    this.modaleTitolo = 'Modifica utente';
    this.utenteInModifica = utente;
    this.formDati = {
      ruolo: utente.ruolo,
      nome: utente.nome,
      cognome: utente.cognome || '',
      email: utente.email,
      password: '',
      matricola: utente.matricola,
      corsoDiStudi: utente.corsoDiStudi,
      ufficio: utente.ufficio,
    };
    this.mostraModale = true;
  }

  chiudiModale() {
    this.mostraModale = false;
  }

  salvaUtente() {
    if (this.utenteInModifica) {
      const dati: any = {
        nome: this.formDati.nome,
        email: this.formDati.email,
      };
      if (this.formDati.password) dati.password = this.formDati.password;
      if (this.formDati.cognome) dati.cognome = this.formDati.cognome;
      if (this.formDati.matricola) dati.matricola = this.formDati.matricola;
      if (this.formDati.corsoDiStudi) dati.corsoDiStudi = this.formDati.corsoDiStudi;
      if (this.formDati.ufficio) dati.ufficio = this.formDati.ufficio;

      this.admin.modificaUtente(this.utenteInModifica.id, dati).subscribe({
        next: () => {
          this.chiudiModale();
          this.caricaUtenti(this.filtroRuolo || undefined);
        },
      });
    } else {
      this.admin.creaUtente(this.formDati).subscribe({
        next: () => {
          this.chiudiModale();
          this.caricaUtenti(this.filtroRuolo || undefined);
        },
      });
    }
  }

  confermaEliminazione(utente: UtenteUnificato) {
    if (confirm(`Eliminare ${utente.nome} ${utente.cognome}? L'operazione è irreversibile.`)) {
      this.admin.eliminaUtente(utente.id).subscribe({
        next: () => this.caricaUtenti(this.filtroRuolo || undefined),
        error: (err) => {
          const msg = err.error?.error || 'Errore durante l\'eliminazione';
          alert(msg);
        },
      });
    }
  }
}
