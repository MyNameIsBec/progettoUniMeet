import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { IonIcon, IonCard, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth';
import { PrenotazioneService } from '../../../core/services/prenotazione';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { Documento } from '../../../core/models/interfacce';

@Component({
  selector: 'app-documenti-docente',
  templateUrl: './documenti-docente.page.html',
  styleUrls: ['./documenti-docente.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon, IonCard, IonCardContent, IonButton, DashboardLayoutComponent]
})
export class DocumentiDocentePage implements OnInit, OnDestroy {
  public nomeDocente: string = '';
  public idDocenteCorrente: string = '';
  public documenti: Documento[] = [];
  public isLoading: boolean = true;
  public filtro: string = 'tutti';

  private userSub: Subscription | null = null;

  constructor(private authService: AuthService, private prenotazioneService: PrenotazioneService) { }

  async ngOnInit() {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.nomeDocente = `${user.nome} ${user.cognome}`;
        this.idDocenteCorrente = user.id;
        this.caricaDocumenti(user.id);
      }
    });
  }

  ionViewWillEnter() {
    if (this.idDocenteCorrente) {
      this.caricaDocumenti(this.idDocenteCorrente);
    }
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
  }

  async caricaDocumenti(idDocente: string) {
    this.isLoading = true;
    try {
      const prenotazioni = await firstValueFrom(
        this.prenotazioneService.getPrenotazioniDocente(idDocente)
      ) as any[];

      const docs: Documento[] = [];
      const dettagliPromises = prenotazioni.map(p => firstValueFrom(this.prenotazioneService.getPrenotazioneById(p.id)));
      const dettagli = await Promise.all(dettagliPromises);

      for (const dp of dettagli) {
        if (dp && dp.documenti && dp.documenti.length > 0) {
          const match = prenotazioni.find(p => p.id === dp.id);
          for (const doc of dp.documenti) {
            const ext = doc.nomeFile.toLowerCase();
            docs.push({
              id: doc.id,
              nomeFile: doc.nomeFile,
              tipo: ext.endsWith('.pdf') ? 'pdf' : (ext.endsWith('.doc') || ext.endsWith('.docx') ? 'doc' : 'altro'),
              studente: dp.studenteId,
              prenotazioneId: dp.id,
              data: match ? match.data : '',
              percorso: doc.percorso 
            });
          }
        }
      }

      this.documenti = docs;
    } catch (err) {
      console.error('Errore caricamento documenti', err);
    } finally {
      this.isLoading = false;
    }
  }

  get documentiFiltrati(): Documento[] {
    if (this.filtro === 'tutti') return this.documenti;
    return this.documenti.filter(d => d.tipo === this.filtro);
  }

  setFiltro(f: string) {
    this.filtro = f;
  }

  apriFile(percorso: string) {
    if (!percorso) return;
    const url = `${this.authService.getApiUrl()}${percorso}`;
    window.open(url, '_blank');
  }

  getIconaFile(tipo: string): string {
    if (tipo === 'pdf') return 'document-text-outline';
    if (tipo === 'doc') return 'document-outline';
    return 'attach-outline';
  }
}
