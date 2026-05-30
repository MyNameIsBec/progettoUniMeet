import { Component, OnInit } from '@angular/core'; 
import { Router } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { firstValueFrom } from 'rxjs'; 
import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonInput, IonItem, IonToggle, IonSelect, IonSelectOption, ToastController, AlertController } from '@ionic/angular/standalone'; 
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component'; 
import { AuthService } from '../../../core/services/auth';

interface ProfiloForm {
  nome: string;
  cognome: string;
  email: string;
  ufficio: string;
  notifiche_app: boolean;
  reminder_ore: number;
}

@Component({
  selector: 'app-profilo-docente',
  templateUrl: './profilo-docente.page.html',
  styleUrls: ['./profilo-docente.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonInput, IonItem, IonToggle, IonSelect, IonSelectOption, DashboardLayoutComponent]
})

export class ProfiloDocentePage implements OnInit {
  loading = true;
  docente: any = null;
  isDarkMode = false;

  form: ProfiloForm = {
    nome: '',
    cognome: '',
    email: '',
    ufficio: '',
    notifiche_app: true,
    reminder_ore: 24
  };

  constructor(
    private authService: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isDarkMode = document.body.classList.contains('dark');
    this.docente = this.authService.getCurrentUser();
    if (this.docente) {
      await this.caricaProfilo();
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  async caricaProfilo() {
    this.loading = true;

    try {
      const data = await firstValueFrom(this.authService.getProfile());
      const user = this.authService.getCurrentUser();

      let notifiche_app = true;
      let reminder_ore = 24;

      if (user) {
        const saved = localStorage.getItem(`pref_${user.id}`);

        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            notifiche_app = parsed?.notifiche_app ?? true;
            reminder_ore = parsed?.reminder_ore ?? 24;
          } catch {
            console.log('Preferenze locali corrotte');
          }
        }
      }

      this.form = {
        nome: data.nome,
        cognome: data.cognome,
        email: data.email,
        ufficio: data.ufficio ?? '',
        notifiche_app,
        reminder_ore
      };

      this.docente = data;
    } catch (err) {
      console.error('Errore caricamento profilo', err);
      await this.showToast('Errore nel caricamento del profilo');
    } finally {
      this.loading = false;
    }
  }

  async salvaModifiche() {
    try {
        this.authService.updateUser({
          nome: this.form.nome,
          cognome: this.form.cognome
        })

      const user = this.authService.getCurrentUser();
      if (user) {
        localStorage.setItem(`pref_${user.id}`, JSON.stringify({
            notifiche_app: this.form.notifiche_app,
            reminder_ore: this.form.reminder_ore
          })
        );
      }

      await this.showToast('Profilo aggiornato con successo!');
    } catch (err) {
      console.error(err);
      await this.showToast('Errore durante aggiornamento profilo');
    }
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
          handler: (data) => {
            this.handleCambioPassword(data);
            return false;
          }
        }
      ]
    });

    await alert.present();
  }

  private async handleCambioPassword(data: any) {
    if (!data.vecchiaPw || !data.nuovaPw || !data.confermaPw) {
      await this.showToast('Compila tutti i campi');
      return;
    }

    if (data.nuovaPw !== data.confermaPw) {
      await this.showToast('Le password non coincidono');
      return;
    }

    if (data.nuovaPw == data.vecchiaPw) {
      await this.showToast('La nuova password è uguale a quella vecchia');
      return;
    }

    try {
      const res = await firstValueFrom(
        this.authService.changePassword(data.vecchiaPw, data.nuovaPw)
      );

      await this.showToast(res.messaggio || 'Password aggiornata');
    } catch (err: any) {
      await this.showToast(err.error?.error || 'Errore nel cambio password', 'danger');
    }
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });

    await toast.present();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}