import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { IonContent } from '@ionic/angular/standalone';
import { VoceMenuNavigazione } from '../../core/models/interfacce';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent, IonContent]
})
export class DashboardLayoutComponent {
  @Input() ruoloUtente: string = 'studente';
  @Input() nomeUtente: string = 'Alessio Lombardo';

  @Input() vociMenu: VoceMenuNavigazione[] = [
    { etichetta: 'Dashboard', percorso: '/dashboard-studente', icona: 'home-outline', esatto: true },
    { etichetta: 'Docenti', percorso: '/elenco-docenti', icona: 'people-outline' },
    { etichetta: 'Prenota', percorso: '/prenota', icona: 'calendar-clear-outline' },
    { etichetta: 'Le mie prenotazioni', percorso: '/riepilogo-prenotazioni', icona: 'calendar-number-outline' },
    { etichetta: 'FAQ / Bacheca', percorso: '/bacheca-studente', icona: 'help-circle-outline' },
    { etichetta: 'Profilo', percorso: '/profilo-studente', icona: 'person-outline' },
  ];

  @Input() vociMenuMobile?: VoceMenuNavigazione[];
}
