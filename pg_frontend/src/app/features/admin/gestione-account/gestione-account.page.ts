import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonLabel, IonIcon, IonButton, IonSearchbar, IonModal, IonInput, IonSelect, IonSelectOption, IonChip, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonCheckbox} from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AdminService, ProfiloAccount, CreaAccountRequest, CorsoListItem } from 'src/app/core/services/admin';
import { AuthService } from 'src/app/core/services/auth';
import { CorsoDiStudi } from 'src/app/core/models/interfacce';

interface CorsiGrouped {
  cds: CorsoDiStudi;
  corsi: CorsoListItem[];
}

@Component({
  selector: 'app-gestione-account',
  templateUrl: './gestione-account.page.html',
  styleUrls: ['./gestione-account.page.scss'],
  standalone: true,
  imports: [ IonLabel, IonIcon, IonButton, IonSearchbar, IonModal, IonInput, IonSelect, IonSelectOption, IonChip, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonCheckbox, CommonModule, FormsModule, DashboardLayoutComponent]})

  export class GestioneAccountPage implements OnInit {
  filtroRuolo = '';
  searchTerm = '';
  accounts: ProfiloAccount[] = [];
  accountsFiltrati: ProfiloAccount[] = [];
  mostraModale = false;
  modaleTitolo = '';
  accountInModifica: ProfiloAccount | null = null;
  inCaricamento = false;
  formDati: CreaAccountRequest = this.formVuoto();
  corsiGrouped: CorsiGrouped[] = [];
  corsiSelezionati = new Set<string>();

  constructor(private admin: AdminService, private route: ActivatedRoute, private authService: AuthService) {
  }

  ngOnInit() {
    this.caricaAccounts();
    this.caricaCorsi();
    if (this.route.snapshot.queryParams['crea'] === 'true') {
      this.apriModaleCrea();
    }
  }

  formVuoto(): CreaAccountRequest {
    return { ruolo: ' ', nome: '', cognome: '', email: '', password: '', corsoDiStudi: '', corsi: [] };
  }

  caricaCorsi() {
    this.admin.getCorsi().subscribe({
      next: (corsi) => {
        this.authService.getCorsiDiStudio().subscribe({
          next: (cdsList) => {
            const cdsMap = new Map(cdsList.map(c => [c.id, c]));
            const grouped: CorsiGrouped[] = [];
            for (const [cdsId, cds] of cdsMap) {
              const corsiOfCds = corsi.filter(c => c.corsoDiStudiId === cdsId);
              if (corsiOfCds.length > 0) {
                grouped.push({ cds, corsi: corsiOfCds });
              }
            }
            this.corsiGrouped = grouped;
          },
        });
      },
    });
  }

  isCorsoSelezionato(id: string): boolean {
    return this.corsiSelezionati.has(id);
  }

  toggleCorso(id: string) {
    if (this.corsiSelezionati.has(id)) {
      this.corsiSelezionati.delete(id);
    } else {
      this.corsiSelezionati.add(id);
    }
  }

  caricaAccounts(ruolo?: string) {
    this.inCaricamento = true;
    this.admin.getAccount(ruolo).subscribe({
      next: (data) => {
        this.accounts = data;
        this.applicaFiltro();
        this.inCaricamento = false;
      },
      error: () => this.inCaricamento = false,
    });
  }

  onFiltroRuolo(ruolo: string) {
    this.filtroRuolo = ruolo;
    if (ruolo) {
      this.caricaAccounts(ruolo);
    } else {
      this.caricaAccounts();
    }
  }

  applicaFiltro() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.accountsFiltrati = [...this.accounts];
    } else {
      this.accountsFiltrati = this.accounts.filter(
        (a) =>
          a.nome.toLowerCase().includes(term) ||
          a.cognome.toLowerCase().includes(term) ||
          a.email.toLowerCase().includes(term) ||
          (a.matricola && a.matricola.toLowerCase().includes(term))
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
    this.modaleTitolo = 'Crea account';
    this.accountInModifica = null;
    this.formDati = this.formVuoto();
    this.corsiSelezionati = new Set<string>();
    this.mostraModale = true;
  }

  apriModaleModifica(account: ProfiloAccount) {
    this.modaleTitolo = 'Modifica account';
    this.accountInModifica = account;

    this.corsiSelezionati = new Set<string>();
    if (account.ruolo === 'docente' && account.corsi) {
      for (const c of account.corsi) {
        this.corsiSelezionati.add(c.id);
      }
    }

    this.formDati = {
      ruolo: account.ruolo,
      nome: account.nome,
      cognome: account.cognome || '',
      email: account.email,
      password: '',
      matricola: account.matricola,
      corsoDiStudi: account.corsoDiStudi || '',
      ufficio: account.ufficio,
    };
    this.mostraModale = true;
  }

  chiudiModale() {
    this.mostraModale = false;
  }

  salvaAccount() {
    if (this.accountInModifica) {
      const dati: any = {
        nome: this.formDati.nome,
        email: this.formDati.email,
      };
      if (this.formDati.password) dati.password = this.formDati.password;
      if (this.formDati.cognome) dati.cognome = this.formDati.cognome;
      if (this.formDati.matricola) dati.matricola = this.formDati.matricola;
      if (this.formDati.corsoDiStudi) dati.corsoDiStudi = this.formDati.corsoDiStudi;
      if (this.formDati.ufficio) dati.ufficio = this.formDati.ufficio;
      if (this.corsiSelezionati.size > 0) dati.corsi = [...this.corsiSelezionati];

      this.admin.modificaAccount(this.accountInModifica.id, dati).subscribe({
        next: () => {
          this.chiudiModale();
          this.caricaAccounts(this.filtroRuolo || undefined);
        },
      });
    } else {
      const dati = { ...this.formDati };
      if (this.corsiSelezionati.size > 0) dati.corsi = [...this.corsiSelezionati];
      this.admin.creaAccount(dati).subscribe({
        next: () => {
          this.chiudiModale();
          this.caricaAccounts(this.filtroRuolo || undefined);
        },
      });
    }
  }

  confermaEliminazione(account: ProfiloAccount) {
    if (confirm(`Eliminare ${account.nome} ${account.cognome}? L'operazione e irreversibile.`)) {
      this.admin.eliminaAccount(account.id).subscribe({
        next: () => this.caricaAccounts(this.filtroRuolo || undefined),
        error: (err) => {
          const msg = err.error?.error || 'Errore durante l\'eliminazione';
          alert(msg);
        },
      });
    }
  }
}
