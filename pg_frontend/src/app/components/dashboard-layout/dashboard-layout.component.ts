import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { IonContent, IonRouterOutlet } from '@ionic/angular/standalone';
import { VoceMenuNavigazione } from '../../core/models/interfacce';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent, IonContent, IonRouterOutlet]
})
export class DashboardLayoutComponent {
  @Input() ruoloUtente: string = 'studente';
  @Input() nomeUtente: string = 'Alessio Lombardo';

  @Input() vociMenu: VoceMenuNavigazione[] = [];

  constructor(private auth: AuthService) {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.ruoloUtente = user.role;
      this.nomeUtente = `${user.nome} ${user.cognome}`;
      
      if (user.role === 'amministratore') {
        this.vociMenu = [
          { etichetta: 'Dashboard', percorso: '/dashboard-admin', icona: 'home-outline', esatto: true },
          { etichetta: 'Utenti', percorso: '/gestione-utenti-admin', icona: 'people-outline' },
          { etichetta: 'Slot', percorso: '/gestione-slot-admin', icona: 'calendar-outline' },
        ];
      } 
      if (user.role === 'docente') {
        this.vociMenu = [
          { etichetta: 'Dashboard', percorso: '/dashboard-docente', icona: 'home-outline', esatto: true },
          { etichetta: 'I miei slot', percorso: '/gestione-slot', icona: 'calendar-outline' },
          { etichetta: 'Prenotazioni', percorso: '/prenotazioni-ricevute', icona: 'list-outline' },
          { etichetta: 'Bacheca', percorso: '/bacheca-docente', icona: 'help-circle-outline' },
          { etichetta: 'Statistiche', percorso: '/statistiche-docente', icona: 'bar-chart-outline' },
          { etichetta: 'Profilo', percorso: '/profilo-docente', icona: 'person-outline' },
        ];
      } 
      if (user.role === 'studente') {
        this.vociMenu = [
          { etichetta: 'Dashboard', percorso: '/dashboard-studente', icona: 'home-outline', esatto: true },
          { etichetta: 'Docenti', percorso: '/elenco-docenti', icona: 'people-outline' },
          { etichetta: 'Prenota', percorso: '/prenota', icona: 'calendar-clear-outline' },
          { etichetta: 'Le mie prenotazioni', percorso: '/riepilogo-prenotazioni', icona: 'calendar-number-outline' },
          { etichetta: 'FAQ / Bacheca', percorso: '/bacheca-studente', icona: 'help-circle-outline' },
          { etichetta: 'Profilo', percorso: '/profilo-studente', icona: 'person-outline' },
        ];
      }
    }
  }
}
