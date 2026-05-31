import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonInput, IonItem, IonSelect, IonSelectOption, IonToggle, AlertController} from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../core/services/auth';
import { StudenteService } from '../../../core/services/studente';
import { ErroriService } from '../../../core/services/errori';

@Component({
  selector: 'app-profilo-studente',
  standalone: true,
  imports: [ CommonModule, FormsModule, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton,IonItem, IonInput, IonSelect, IonSelectOption, IonToggle, DashboardLayoutComponent],
  templateUrl: './profilo-studente.page.html',
  styleUrls: ['./profilo-studente.page.scss'],
})
export class ProfiloStudentePage implements OnInit {
  isDarkMode = false;
  studente: any = null;
  form = {
    nome: '',
    cognome: '',
    email: '',
    corsoDiStudi: '',
    notificheApp: true,
    notificheEmail: true,
    reminderOre: 24,
    tema: 'system',
    lingua: 'it',
  };
  loading = true;
  salvataggioInCorso = false;



  constructor(
    private authService: AuthService,
    private studenteService: StudenteService,
    private erroriService: ErroriService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.isDarkMode = document.body.classList.contains('dark');
    this.caricaProfilo();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  caricaProfilo() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.studenteService.getProfilo(user.id).subscribe({
      next: (data: any) => {
        this.studente = data;

        let notifiche_app = true;
        let reminder_ore = 24;
        const savedPref = localStorage.getItem(`pref_${user.id}`);
        if (savedPref) {
          try {
            const parsed = JSON.parse(savedPref);
            notifiche_app = parsed.notifiche_app !== undefined ? parsed.notifiche_app : true;
            reminder_ore = parsed.reminder_ore !== undefined ? parsed.reminder_ore : 24;
          } catch (e) {
            console.error('Errore parsing preferenze', e);
          }
        }

        this.form = {
          nome: data.nome,
          cognome: data.cognome,
          email: data.email,
          corsoDiStudi: data.corsoDiStudi || data.corso_di_studi,
          notificheApp: data.notificheApp ?? notifiche_app,
          notificheEmail: data.notificheEmail ?? true,
          reminderOre: data.reminderOre ?? reminder_ore,
          tema: data.tema ?? 'system',
          lingua: data.lingua ?? 'it',
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore caricamento profilo', err);
        this.loading = false;
        this.erroriService.gestoreErrori(err);
      }
    });

  }

  salvaModifiche() {
    if (!this.studente) return;

    this.salvataggioInCorso = true;
    this.studenteService.aggiornaProfilo(this.studente.matricola, this.form).subscribe({
      next: () => {
        this.salvataggioInCorso = false;
        const user = this.authService.getCurrentUser();
        if (user) {
          localStorage.setItem(`pref_${user.id}`, JSON.stringify({
            notifiche_app: this.form.notificheApp,
            reminder_ore: this.form.reminderOre
          }));
        }

        this.authService.updateUser({
          nome: this.form.nome,
          cognome: this.form.cognome
        });

        this.showToast('Profilo aggiornato con successo!');
      },
        error: (err) => {
          console.error('Errore salvataggio profilo', err);
          this.salvataggioInCorso = false;
          this.erroriService.gestoreErrori(err);
        }
    });
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
            if (!data.vecchiaPw || !data.nuovaPw || !data.confermaPw) {
              this.showToast('Compila tutti i campi');
              return false;
            }
            if (data.nuovaPw !== data.confermaPw) {
              this.showToast('Le password non coincidono');
              return false;
            }
            if (data.vecchiaPw === data.nuovaPw) {
              this.showToast('La nuova password non può essere uguale alla password attuale');
              return false;
            }
            this.eseguiCambioPassword(data.vecchiaPw, data.nuovaPw);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  eseguiCambioPassword(vecchia: string, nuova: string) {
    if (!this.studente) return;
    this.studenteService.cambiaPassword(this.studente.matricola, vecchia, nuova).subscribe({
      next: (res) => this.showToast(res.messaggio),
      error: (err) => {
      console.error('Errore cambio password', err);
      this.erroriService.gestoreErrori(err);
    }
    });
  }

  async confermaEliminaAccount() {
    const alert = await this.alertCtrl.create({
      header: 'Elimina Account',
      message: 'Sei sicuro di voler eliminare definitivamente il tuo account? Questa azione non è reversibile.',
      cssClass: 'danger-alert',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: () => {
            this.eseguiEliminaAccount();
          }
        }
      ]
    });
    await alert.present();
  }

  private eseguiEliminaAccount() {
    if (!this.studente) return;
    this.studenteService.eliminaAccount(this.studente.matricola).subscribe({
      next: async (res) => {
        await this.showToast(res.messaggio);
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
      console.error('Errore eliminazione account', err);
      this.erroriService.gestoreErrori(err);
    }
    });
  }


  async showToast(msg: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const alert = await this.alertCtrl.create({
      message: msg,
      buttons: ['OK'],
      cssClass: color === 'danger' ? 'danger-alert' : ''
    });
    await alert.present();
  }

  resetForm() {
    if (this.studente) {
      const user = this.authService.getCurrentUser();
      let notifiche_app = true;
      let reminder_ore = 24;
      if (user) {
        const savedPref = localStorage.getItem(`pref_${user.id}`);
        if (savedPref) {
          try {
            const parsed = JSON.parse(savedPref);
            notifiche_app = parsed.notifiche_app !== undefined ? parsed.notifiche_app : true;
            reminder_ore = parsed.reminder_ore !== undefined ? parsed.reminder_ore : 24;
          } catch (e) {
            console.error('Errore parsing preferenze', e);
          }
        }
      }

      this.form = {
        nome: this.studente.nome,
        cognome: this.studente.cognome,
        email: this.studente.email,
        corsoDiStudi: this.studente.corsoDiStudi || this.studente.corso_di_studi,
        notificheApp: notifiche_app,
        notificheEmail: this.studente.notificheEmail ?? true,
        reminderOre: reminder_ore,
        tema: this.studente.tema ?? 'system',
        lingua: this.studente.lingua ?? 'it',
      };
    }
  }

}