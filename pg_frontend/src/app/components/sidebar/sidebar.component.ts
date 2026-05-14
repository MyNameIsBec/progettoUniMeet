import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { VoceMenuNavigazione } from '../../core/models/interfacce';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon]
})
export class SidebarComponent {
  @Input() ruoloUtente: string = 'studente';
  @Input() vociMenu: VoceMenuNavigazione[] = [];

  constructor(private router: Router) {
  }

  isLinkActive(voce: VoceMenuNavigazione): boolean {
    const currentUrl = this.router.url;
    
    // Caso speciale: dettaglio prenotazione deve attivare "Le mie prenotazioni"
    if (voce.percorso === '/riepilogo-prenotazioni' && currentUrl.includes('/dettaglio-prenotazione')) {
      return true;
    }

    return this.router.isActive(voce.percorso, voce.esatto || false);
  }
}
