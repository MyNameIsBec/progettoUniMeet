import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonInput, IonItem, AlertController } from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-profilo-docente',
  templateUrl: './profilo-docente.page.html',
  styleUrls: ['./profilo-docente.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonInput, IonItem,
    DashboardLayoutComponent
  ]
})
export class ProfiloDocentePage implements OnInit {
  public loading = true;
  public docente: any = null;
  public form = { nome: '', cognome: '', email: '', ufficio: '' };

  constructor(
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.caricaProfilo();
  }

  async caricaProfilo() {
    this.loading = true;
    try {
      const data = await firstValueFrom(this.authService.getProfile());
      this.docente = data;
      this.form = { nome: data.nome, cognome: data.cognome, email: data.email, ufficio: data.ufficio || '' };
    } catch (err) {
      console.error('Errore caricamento profilo', err);
    }
    this.loading = false;
  }

  salvaModifiche() {
    this.authService.updateUser({ nome: this.form.nome, cognome: this.form.cognome });
    this.showToast('Profilo aggiornato con successo!');
  }

  async apriCambioPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Cambia Password',
      inputs: [
        { name: 'vecchiaPw', type: 'password', placeholder: 'Password attuale' },
        { name: 'nuovaPw', type: 'password', placeholder: 'Nuova password' },
        { name: 'confermaPw', type: 'password', placeholder: 'Conferma nuova password' }
      ],
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Conferma',
          handler: async (data) => {
            if (!data.vecchiaPw || !data.nuovaPw || !data.confermaPw) {
              this.showToast('Compila tutti i campi');
              return false;
            }
            if (data.nuovaPw !== data.confermaPw) {
              this.showToast('Le password non coincidono');
              return false;
            }
            try {
              const res = await firstValueFrom(this.authService.changePassword(data.vecchiaPw, data.nuovaPw));
              this.showToast(res.messaggio);
            } catch (err: any) {
              this.showToast(err.error?.error || 'Errore nel cambio password');
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async showToast(msg: string) {
    const alert = await this.alertCtrl.create({ message: msg, buttons: ['OK'] });
    await alert.present();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
