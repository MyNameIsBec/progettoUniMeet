import { Component, OnInit } from '@angular/core';import { RouterLink } from '@angular/router';import { CommonModule } from '@angular/common';import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton } from '@ionic/angular/standalone';import { Docente } from '../../../core/models/interfacce';import { AuthService } from '../../../core/services/auth';import { StudenteService } from '../../../core/services/studente';import { DocenteService } from '../../../core/services/docente';import { firstValueFrom } from 'rxjs';import { FormsModule } from '@angular/forms';import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';@Component({  selector: 'app-elenco-docenti',  templateUrl: './elenco-docenti.page.html',  styleUrls: ['./elenco-docenti.page.scss'],  standalone: true,  imports: [ CommonModule,RouterLink,IonIcon,IonCard,IonCardContent,IonCardHeader,IonCardTitle,IonButton,FormsModule,DashboardLayoutComponent]})export class ElencoDocentiPage implements OnInit {  public listaDocenti: Docente[] = [];  public docentiOriginali: Docente[] = [];   public ricerca: string = '';  constructor(private authService: AuthService, private studenteService: StudenteService, private docenteService: DocenteService) {}    private mioCorso: string = '';
  private corsoId: string = '';
  async ngOnInit() {
    try {
      const user = this.authService.getCurrentUser();
      if (user != null) {
        const profilo = await firstValueFrom(this.studenteService.getProfilo(user.id));
        if (profilo && profilo.corsoDiStudi) {
          this.mioCorso = profilo.corsoDiStudi;
        }
        if (profilo && profilo.corsoDiStudiId) {
          this.corsoId = profilo.corsoDiStudiId;
        }
        await this.caricaDocenti();
      }
    }
    catch (error) {
      console.error('Errore durante il caricamento dei docenti', error);
    }
  }
  async caricaDocenti() {
    try {
      const docenti = await firstValueFrom(this.docenteService.getDocentiPerCorso(this.mioCorso || '', this.ricerca, this.corsoId || undefined));
      this.listaDocenti = docenti.map(d => ({ ...d, iniziali: `${d.nome?.[0] || ''}${d.cognome?.[0] || ''}`.toUpperCase() || '??' }));
      this.docentiOriginali = [...this.listaDocenti];    } catch (error) {      console.error('Errore caricamento docenti', error);    }  }  cerca() {    if (!this.ricerca) {      this.listaDocenti = [...this.docentiOriginali];      return;    }    const term = this.ricerca.toLowerCase().trim();    const searchTerms = term.split(/\s+/);    this.listaDocenti = this.docentiOriginali.filter(d => {      const fullString = `${d.nome} ${d.cognome} ${d.materia}`.toLowerCase();      return searchTerms.every(t => fullString.includes(t));    });  }}
