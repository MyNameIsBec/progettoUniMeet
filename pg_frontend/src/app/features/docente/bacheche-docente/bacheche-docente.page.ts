import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonInput, IonTextarea, IonHeader, IonToolbar, IonTitle, IonContent, AlertController } from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { BachecaService } from '../../../core/services/bacheca';
import { DocenteService } from '../../../core/services/docente';
import { AuthService } from '../../../core/services/auth';
import { FAQ, Bacheca } from '../../../core/models/interfacce';

@Component({
  selector: 'app-bacheche-docente',
  templateUrl: './bacheche-docente.page.html',
  styleUrls: ['./bacheche-docente.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonInput, IonTextarea,
    IonHeader, IonToolbar, IonTitle, IonContent,
    DashboardLayoutComponent
  ]
})
export class BachecheDocentePage implements OnInit {
  public bacheca: Bacheca | null = null;
  public faqs: FAQ[] = [];
  public nomeCorsoDiStudi = '';
  public loading = true;

  constructor(
    private bachecaService: BachecaService,
    private docenteService: DocenteService,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.caricaBacheca();
  }

  async caricaBacheca() {
    this.loading = true;
    try {
      const user = this.authService.getCurrentUser();
      if (!user) return;

      const docente = await firstValueFrom(this.docenteService.getDettagliDocente(user.id)) as any;
      const corsi = docente.corsiDiStudi || [];
      if (corsi.length === 0) {
        this.loading = false;
        return;
      }

      this.nomeCorsoDiStudi = corsi[0].nome;
      this.bacheca = await firstValueFrom(this.bachecaService.getBachecaPerCorsoDiStudi(corsi[0].id));
      this.faqs = await firstValueFrom(this.bachecaService.getFaq(corsi[0].id));
    } catch (err) {
      console.error('Errore caricamento bacheca', err);
    }
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
              const user = this.authService.getCurrentUser();
              const docente = await firstValueFrom(this.docenteService.getDettagliDocente(user!.id)) as any;
              const cdsId = (docente.corsiDiStudi || [])[0]?.id;
              if (cdsId) {
                await firstValueFrom(this.bachecaService.aggiungiFaq(cdsId, { domanda: data.domanda, risposta: data.risposta }));
                await this.caricaBacheca();
              }
            } catch (err) {
              console.error('Errore creazione FAQ', err);
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
              await firstValueFrom(this.bachecaService.aggiornaFaq('', { ...faq, domanda: data.domanda, risposta: data.risposta }));
              await this.caricaBacheca();
            } catch (err) {
              console.error('Errore modifica FAQ', err);
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
              await this.caricaBacheca();
            } catch (err) {
              console.error('Errore eliminazione FAQ', err);
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
