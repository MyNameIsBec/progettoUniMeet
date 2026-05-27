import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonItem, IonSelect, IonSelectOption, AlertController } from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { BachecaService } from '../../../core/services/bacheca';
import { FAQ, Bacheca } from '../../../core/models/interfacce';

@Component({
  selector: 'app-bacheche-docente',
  templateUrl: './bacheche-docente.page.html',
  styleUrls: ['./bacheche-docente.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton,
    IonItem, IonSelect, IonSelectOption,
    DashboardLayoutComponent
  ]
})
export class BachecheDocentePage implements OnInit {
  public bacheca: Bacheca | null = null;
  public faqs: FAQ[] = [];
  public bacheche: Bacheca[] = [];
  public corsoSelezionatoId: string = '';
  public nomeCorso = '';
  public loading = true;

  constructor(
    private bachecaService: BachecaService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.caricaBacheche();
  }

  async caricaBacheche() {
    this.loading = true;
    try {
      this.bacheche = await firstValueFrom(this.bachecaService.getBachecheDocente());
      if (this.bacheche.length > 0) {
        this.corsoSelezionatoId = this.bacheche[0].idCorso;
        this.selezionaBacheca(this.bacheche[0]);
      } else {
        this.loading = false;
      }
    } catch (err) {
      console.error('Errore caricamento bacheche', err);
      this.loading = false;
    }
  }

  onCorsoChange(event: any) {
    const idCorso = event.detail.value;
    const bacheca = this.bacheche.find(b => b.idCorso === idCorso);
    if (bacheca) {
      this.selezionaBacheca(bacheca);
    }
  }

  private selezionaBacheca(bacheca: Bacheca) {
    this.bacheca = bacheca;
    this.corsoSelezionatoId = bacheca.idCorso;
    this.nomeCorso = bacheca.nomeCorso;
    this.faqs = bacheca.faqs ?? [];
    this.loading = false;
  }

  async aggiungiFaq() {
    const alert = await this.alertCtrl.create({
      header: 'Nuova FAQ',
      inputs: [
        { name: 'domanda', type: 'text', placeholder: 'Domanda' },
        { name: 'risposta', type: 'textarea', placeholder: 'Risposta' }
      ],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Aggiungi',
          handler: async (data) => {
            if (!data.domanda || !data.risposta) return false;
            try {
              await firstValueFrom(this.bachecaService.aggiungiFaq(this.corsoSelezionatoId, {
                domanda: data.domanda,
                risposta: data.risposta,
              }));
              const aggiornata = await firstValueFrom(this.bachecaService.getBachecaByCorso(this.corsoSelezionatoId));
              this.selezionaBacheca(aggiornata);
            } catch (err) {
              console.error('Errore creazione FAQ', err);
              return false;
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async modificaFaq(faq: FAQ) {
    const alert = await this.alertCtrl.create({
      header: 'Modifica FAQ',
      inputs: [
        { name: 'domanda', type: 'text', value: faq.domanda, placeholder: 'Domanda' },
        { name: 'risposta', type: 'textarea', value: faq.risposta, placeholder: 'Risposta' }
      ],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Salva',
          handler: async (data) => {
            if (!data.domanda || !data.risposta) return false;
            try {
              await firstValueFrom(this.bachecaService.aggiornaFaq('', { ...faq, domanda: data.domanda, risposta: data.risposta, }));
              const aggiornata = await firstValueFrom(this.bachecaService.getBachecaByCorso(this.corsoSelezionatoId));
              this.selezionaBacheca(aggiornata);
            } catch (err) {
              console.error('Errore modifica FAQ', err);
              return false;
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminaFaq(faq: FAQ) {
    const alert = await this.alertCtrl.create({
      header: 'Elimina FAQ',
      message: 'Sei sicuro di voler eliminare questa FAQ?',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: async () => {
            try {
              await firstValueFrom(this.bachecaService.eliminaFaq(faq.id));
              const aggiornata = await firstValueFrom(this.bachecaService.getBachecaByCorso(this.corsoSelezionatoId));
              this.selezionaBacheca(aggiornata);
              return true;
            } catch (err) {
              console.error('Errore eliminazione FAQ', err);
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  invertiStatoFaq(faq: FAQ) {
    faq.aperta = !faq.aperta;
  }
}
