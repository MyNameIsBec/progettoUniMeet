import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { Bacheca, FAQ } from '../../../core/models/interfacce';
import { BachecaService } from '../../../core/services/bacheca';
import { AuthService } from '../../../core/services/auth';
import { StudenteService } from '../../../core/services/studente';
import { firstValueFrom } from 'rxjs';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';

export interface LinkUtile {
  titolo: string;
  descrizione: string;
  icona: string;
  colore: string;
  url: string;
}

@Component({
  selector: 'app-bacheca-studente',
  templateUrl: './bacheca-studente.page.html',
  styleUrls: ['./bacheca-studente.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    DashboardLayoutComponent
  ]
})
export class BachecaStudentePage implements OnInit {

  public collegamentiUtili: LinkUtile[] = [
    {
      titolo: 'Sito ufficiale Unipa',
      descrizione: 'Portale ufficiale per tutte le comunicazioni universitarie.',
      icona: 'school-outline',
      colore: 'blue',
      url: 'https://www.unipa.it/'
    },
    {
      titolo: 'Portale Studenti',
      descrizione: 'Accedi alla tua pagina universitaria ',
      icona: 'file-tray-full-outline',
      colore: 'green',
      url: 'https://immaweb.unipa.it/immaweb/home.seam'
    }
  ];

  constructor(
    private bachecaService: BachecaService,
    private authService: AuthService,
    private studenteService: StudenteService
  ) { }

  public bacheca?: Bacheca;
  public listaFaq: FAQ[] = [];
  public docentiDisponibili: { id: string; nome: string }[] = [];
  public docenteSelezionato: string = 'tutti';

  get listaFaqFiltrate(): FAQ[] {
    if (this.docenteSelezionato === 'tutti') {
      return this.listaFaq;
    }
    return this.listaFaq.filter(faq => faq.idDocente === this.docenteSelezionato);
  }

  async ngOnInit() {
    try {
      const user = this.authService.getCurrentUser();
      if (user != null) {
        const profilo = await firstValueFrom(this.studenteService.getProfilo(user.id));
        if (profilo.corsoDiStudiId != null) {
          const bacheca = await firstValueFrom(this.bachecaService.getBachecaPerCorsoDiStudi(profilo.corsoDiStudiId));
          if (bacheca != null) {
            this.bacheca = bacheca;
            this.listaFaq = bacheca.faqs ?? [];
            this.docentiDisponibili = this.estraiDocenti(this.listaFaq);
          }
        }
      }
    } catch (error) {
      console.error('Errore durante il caricamento della bacheca', error);
    }
  }

  private estraiDocenti(faqs: FAQ[]): { id: string; nome: string }[] {
    const mappa = new Map<string, string>();
    for (const faq of faqs) {
      if (faq.idDocente && faq.nomeDocente) {
        mappa.set(faq.idDocente, faq.nomeDocente);
      }
    }
    return Array.from(mappa, ([id, nome]) => ({ id, nome }));
  }

  public invertiStatoFaq(faq: FAQ): void {
    faq.aperta = !faq.aperta;
  }

  public onDocenteChange(event: CustomEvent): void {
    this.docenteSelezionato = (event.detail.value as string) ?? 'tutti';
  }
}