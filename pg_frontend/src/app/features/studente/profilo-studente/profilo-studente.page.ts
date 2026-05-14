import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonToggle,
  AlertController,
} from '@ionic/angular/standalone';

import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { AuthService } from '../../../core/services/auth';
import { StudenteService } from '../../../core/services/studente';

@Component({
  selector: 'app-profilo-studente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    DashboardLayoutComponent,
  ],
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
    notifiche_app: true,
    notifiche_email: true,
    reminder_ore: 24
  };

  loading = true;
  salvataggioInCorso = false;

  constructor(
    private authService: AuthService,
    private studenteService: StudenteService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.isDarkMode = document.body.classList.contains('dark');
    this.caricaProfilo();
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
        this.form = {
          nome: data.nome,
          cognome: data.cognome,
          email: data.email,
          corsoDiStudi: data.corsoDiStudi || data.corso_di_studi,
          notifiche_app: data.notifiche_app,
          notifiche_email: data.notifiche_email,
          reminder_ore: data.reminder_ore
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore caricamento profilo', err);
        this.loading = false;
      }
    });
  }

  salvaModifiche() {
    if (!this.studente) return;

    this.salvataggioInCorso = true;
    this.studenteService.aggiornaProfilo(this.studente.matricola, this.form).subscribe({
      next: () => {
        this.salvataggioInCorso = false;
        
        // Aggiorna la sessione locale per riflettere il cambio nome ovunque
        this.authService.updateUser({
          nome: this.form.nome,
          cognome: this.form.cognome
        });

        this.showToast('Profilo aggiornato con successo!');
      },
      error: (err) => {
        console.error('Errore salvataggio profilo', err);
        this.salvataggioInCorso = false;
        this.showToast('Errore durante il salvataggio.');
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
      error: (err) => this.showToast(err.error?.error || 'Errore nel cambio password')
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
      error: (err) => this.showToast('Errore durante l\'eliminazione dell\'account.')
    });
  }

  async showToast(msg: string) {
    const alert = await this.alertCtrl.create({
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }

  resetForm() {
    if (this.studente) {
      this.form = {
        nome: this.studente.nome,
        cognome: this.studente.cognome,
        email: this.studente.email,
        corsoDiStudi: this.studente.corsoDiStudi || this.studente.corso_di_studi,
        notifiche_app: this.studente.notifiche_app,
        notifiche_email: this.studente.notifiche_email,
        reminder_ore: this.studente.reminder_ore
      };
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }
}