import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonSegment, IonSegmentButton, IonLabel, IonItem, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
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
  imports: [ CommonModule, FormsModule, RouterLink, IonIcon, IonCard, IonCardContent, IonCardHeader,IonCardTitle,IonButton,IonSegment,IonSegmentButton,IonLabel,IonItem,IonSelect,IonSelectOption,DashboardLayoutComponent]})
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

  public bacheche: Bacheca[] = [];
  public bachecaCorrente?: Bacheca;
  public listaFaq: FAQ[] = [];
  public docentiDisponibili: { id: string; nome: string }[] = [];
  public docenteSelezionato: string = 'tutti';
  public corsoSelezionatoId: string = '';
  public loading = true;

  get listaFaqFiltrate(): FAQ[] {
    let faqs = this.listaFaq;
    if (this.docenteSelezionato !== 'tutti') {
      faqs = faqs.filter(faq => faq.idDocente === this.docenteSelezionato);
    }
    return faqs;
  }

  async ngOnInit() {
    try {
      const user = this.authService.getCurrentUser();
      if (user != null) {
        const profilo = await firstValueFrom(this.studenteService.getProfilo(user.id));
        if (profilo.corsoDiStudiId != null) {
          this.bacheche = await firstValueFrom(this.bachecaService.getBachecaPerCorsoDiStudi(profilo.corsoDiStudiId));
          if (this.bacheche.length > 0) {
            this.selezionaBacheca(this.bacheche[0]);
          }
        }
      }
    } catch (error) {
      console.error('Errore durante il caricamento della bacheca', error);
    }
    this.loading = false;
  }

  onCorsoChange(event: any) {
    const idCorso = event.detail.value;
    const bacheca = this.bacheche.find(b => b.idCorso === idCorso);
    if (bacheca) {
      this.selezionaBacheca(bacheca);
    }
  }

  private selezionaBacheca(bacheca: Bacheca) {
    this.bachecaCorrente = bacheca;
    this.corsoSelezionatoId = bacheca.idCorso;
    this.listaFaq = bacheca.faqs ?? [];
    this.docentiDisponibili = this.estraiDocenti(this.listaFaq);
    this.docenteSelezionato = 'tutti';
  }

  private estraiDocenti(faqs: FAQ[]) {
  const mappa = new Map<string, string>();
  faqs.forEach(faq => {
    if (faq.idDocente && faq.nomeDocente) {
      mappa.set(faq.idDocente, faq.nomeDocente);
    }
  });
  return [...mappa].map(([id, nome]) => ({ id, nome }));
}

  public invertiStatoFaq(faq: FAQ): void {
    faq.aperta = !faq.aperta;
  }

  public onDocenteChange(event: CustomEvent): void {
    this.docenteSelezionato = (event.detail.value as string) ?? 'tutti';
  }
}
