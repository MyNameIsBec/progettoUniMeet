import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  @Input() ruoloUtente: string = '';
  @Input() nomeUtente: string = '';

  @Input() vociMenu: VoceMenuNavigazione[] = [];
  
  private userSub: Subscription | null = null;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.userSub = this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.ruoloUtente = user.role;
        this.nomeUtente = `${user.nome} ${user.cognome}`;
        this.configuraMenu(user.role);
      }
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  private configuraMenu(role: string) {
    if (role === 'amministratore') {
      this.vociMenu = [
        { etichetta: 'Dashboard', percorso: '/dashboard-admin', icona: 'home-outline', esatto: true },
        { etichetta: 'Utenti', percorso: '/gestione-utenti-admin', icona: 'people-outline' },
        { etichetta: 'Slot', percorso: '/gestione-slot-admin', icona: 'calendar-outline' },
      ];
    } 
    else if (role === 'docente') {
      this.vociMenu = [
        { etichetta: 'Dashboard', percorso: '/dashboard-docente', icona: 'home-outline', esatto: true },
        { etichetta: 'I miei slot', percorso: '/gestione-slot', icona: 'calendar-outline' },
        { etichetta: 'Prenotazioni', percorso: '/prenotazioni-ricevute', icona: 'list-outline' },
        { etichetta: 'Bacheca', percorso: '/bacheca-docente', icona: 'help-circle-outline' },
        { etichetta: 'Statistiche', percorso: '/statistiche-docente', icona: 'bar-chart-outline' },
        { etichetta: 'Profilo', percorso: '/profilo-docente', icona: 'person-outline' },
      ];
    } 
    else if (role === 'studente') {
      this.vociMenu = [
        { etichetta: 'Dashboard', percorso: '/dashboard-studente', icona: 'home-outline', esatto: true },
        { etichetta: 'Docenti', percorso: '/elenco-docenti', icona: 'people-outline' },
        { etichetta: 'Prenota', percorso: '/prenota', icona: 'calendar-clear-outline' },
        { etichetta: 'Le mie prenotazioni', percorso: '/riepilogo-prenotazioni', icona: 'calendar-number-outline' },
        { etichetta: 'FAQ / Bacheca', percorso: '/bacheca-studente', icona: 'help-circle-outline' },
        { etichetta: 'Segnalazione', percorso: '/segnalazione', icona: 'alert-circle-outline' },
      ];
    }
  }
}
