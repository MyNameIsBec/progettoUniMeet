import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton } from '@ionic/angular/standalone';
import { FAQ, Bacheca, Studente } from '../../../core/models/interfacce';
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

  public listaFaq: FAQ[] = [];

  async ngOnInit() {
    try {
      const user = this.authService.getCurrentUser();
      if(user != null){
      const profilo = await firstValueFrom(this.studenteService.getProfilo(user.id));
        if (profilo.corsoDiStudiId != null) {
          const bacheca = await firstValueFrom(this.bachecaService.getBachecaPerCorsoDiStudi(profilo.corsoDiStudiId));
          if (bacheca != null) {
            this.listaFaq = await firstValueFrom(this.bachecaService.getFaq(bacheca.idCorsoDiStudi ?? ''));
          }
        }
      }
    } catch (error) {
      console.error('Errore durante il caricamento della bacheca', error);
    }
  }

  public invertiStatoFaq(faq: FAQ): void {
    faq.aperta = !faq.aperta;
  }
}