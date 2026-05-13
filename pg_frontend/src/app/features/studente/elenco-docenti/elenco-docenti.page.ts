import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { Corso, Docente } from '../../../core/models/interfacce';
import { AuthService } from '../../../core/services/auth';
import { StudenteService } from '../../../core/services/studente';
import { DocenteService } from '../../../core/services/docente';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-elenco-docenti',
  templateUrl: './elenco-docenti.page.html',
  styleUrls: ['./elenco-docenti.page.scss'],
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
    IonSelect,
    IonSelectOption,
    FormsModule,
    DashboardLayoutComponent
  ]
})
export class ElencoDocentiPage {
  public listaDocenti: Docente[] = [];
  public docentiOriginali: Docente[] = []; // Necessario per non perdere i dati durante il filtraggio
  public listaCorsi: Corso[] = [];

  public ricerca: string = '';
  public corsoSelezionato: string = 'tutti';

  constructor(private authService: AuthService, private studenteService: StudenteService, private docenteService: DocenteService) {
  }

  async ngOnInit() {
    try {
      const user = this.authService.getCurrentUser();
      if (user != null) {
        const profilo = await firstValueFrom(this.studenteService.getProfilo(user.id));
        if (profilo.corsoDiStudi != null) {
          this.docentiOriginali = await firstValueFrom(this.docenteService.getDocentiPerCorso(profilo.corsoDiStudi));
          this.listaDocenti = [...this.docentiOriginali];
          this.listaCorsi = await firstValueFrom(this.studenteService.getCorsi(profilo.matricola));
        }
      }
    }
    catch (error) {
      console.error('Errore durante il caricamento dei docenti', error);
    }
  }

  cerca() {
    this.applicaFiltri();
  }

  onFilterCorso(event: any) {
    this.corsoSelezionato = event.detail.value;
    this.applicaFiltri();
  }

  applicaFiltri() {
    this.listaDocenti = this.docentiOriginali.filter(docente => {
      const filtroRicerca = !this.ricerca ||
        docente.nome.toLowerCase().includes(this.ricerca.toLowerCase()) ||
        docente.materia.toLowerCase().includes(this.ricerca.toLowerCase());

      const filtroCorso = this.corsoSelezionato === 'tutti' ||
        (docente.corsoDiStudi && docente.corsoDiStudi.includes(this.corsoSelezionato));

      return filtroRicerca && filtroCorso;
    });
  }
}