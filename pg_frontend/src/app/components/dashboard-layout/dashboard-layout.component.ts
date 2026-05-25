import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { IonContent } from '@ionic/angular/standalone';
import { VoceMenuNavigazione } from '../../core/models/interfacce';
import { AuthService } from '../../core/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent, IonContent]
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  ruoloCorrente: string = '';
  nomeAccount: string = '';
  vociMenu: VoceMenuNavigazione[] = [];
  private userSub?: Subscription;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.userSub = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.ruoloCorrente = user.role;
        this.nomeAccount = `${user.nome} ${user.cognome}`;
        this.configuraMenu(user.role);
      }
    });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  private configuraMenu(role: string) {
    if (role === 'amministratore') {
      this.vociMenu = [
        { etichetta: 'Dashboard', percorso: '/dashboard-admin', icona: 'stats-chart-outline', esatto: true },
        { etichetta: 'Account', percorso: '/gestione-account', icona: 'people-outline' },
        { etichetta: 'Slot', percorso: '/gestione-slot-admin', icona: 'calendar-outline' },
        { etichetta: 'Prenotazioni', percorso: '/gestione-prenotazioni-admin', icona: 'calendar-number-outline' },
        { etichetta: 'Calendario', percorso: '/gestione-calendario', icona: 'calendar-outline' },
        { etichetta: 'Segnalazioni', percorso: '/gestione-segnalazioni', icona: 'flag-outline' },
      ];
    }
    else if (role === 'docente') {
      this.vociMenu = [
        { etichetta: 'Dashboard', percorso: '/dashboard-docente', icona: 'home-outline', esatto: true },
        { etichetta: 'I miei slot', percorso: '/gestione-slot', icona: 'calendar-outline' },
        { etichetta: 'Prenotazioni', percorso: '/prenotazioni-ricevute', icona: 'list-outline' },
        { etichetta: 'Documenti', percorso: '/documenti-docente', icona: 'folder-open-outline' },
        { etichetta: 'Bacheche', percorso: '/bacheche-docente', icona: 'help-circle-outline' },
        { etichetta: 'Statistiche', percorso: '/statistiche-docente', icona: 'bar-chart-outline' },
        { etichetta: 'Segnalazioni', percorso: '/segnalazioni-docente', icona: 'alert-circle-outline' },
      ];
    }
    else if (role === 'studente') {
      this.vociMenu = [
        { etichetta: 'Dashboard', percorso: '/dashboard-studente', icona: 'home-outline', esatto: true },
        { etichetta: 'Docenti', percorso: '/elenco-docenti', icona: 'people-outline' },
        { etichetta: 'Prenota', percorso: '/prenota', icona: 'calendar-clear-outline' },
        { etichetta: 'Le mie prenotazioni', percorso: '/riepilogo-prenotazioni', icona: 'calendar-number-outline' },
        { etichetta: 'FAQ / Bacheca', percorso: '/bacheca-studente', icona: 'help-circle-outline' },
        { etichetta: 'Segnalazioni', percorso: '/segnalazioni-studente', icona: 'alert-circle-outline' },
      ];
    }
  }
}
