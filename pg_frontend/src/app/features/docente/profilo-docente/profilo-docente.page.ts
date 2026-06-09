import { Component, OnInit } from '@angular/core'; import { Router } from '@angular/router'; import { CommonModule } from '@angular/common'; import { FormsModule } from '@angular/forms'; import { firstValueFrom } from 'rxjs'; import { IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonInput, IonItem, IonToggle, IonSelect, IonSelectOption, ToastController, AlertController } from '@ionic/angular/standalone'; import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component'; import { AuthService } from '../../../core/services/auth';import { DocenteService } from '../../../core/services/docente';interface ProfiloForm {
  nome: string;
  cognome: string;
  email: string;
  ufficio: string;
  notificheApp: boolean;
  notificheEmail: boolean;
  reminderOre: number;
  tema: string;
  lingua: string;
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
  isCambioPasswordAperto = false;
  mostraVecchiaPassword = false;
  mostraNuovaPassword = false;
  mostraConfermaNuovaPassword = false;
    formPassword = { vecchiaPw: '', nuovaPw: '', confermaPw: '' };
  form: ProfiloForm = {
    nome: '',    cognome: '',    email: '',    ufficio: '',    notificheApp: true,    notificheEmail: true,    reminderOre: 24,    tema: 'system',    lingua: 'it',  };  constructor(    private authService: AuthService,    private docenteService: DocenteService,    private toastCtrl: ToastController,    private alertCtrl: AlertController,    private router: Router  ) {}  async ngOnInit() {    this.isDarkMode = document.body.classList.contains('dark');    this.docente = this.authService.getCurrentUser();    if (this.docente) {      await this.caricaProfilo();    }  }  toggleDarkMode() {    this.isDarkMode = !this.isDarkMode;    document.body.classList.toggle('dark', this.isDarkMode);    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');  }  async caricaProfilo() {    this.loading = true;    try {      const data = await firstValueFrom(this.authService.getProfile());      this.form = {        nome: data.nome,        cognome: data.cognome,        email: data.email,        ufficio: data.ufficio ?? '',        notificheApp: data.notificheApp ?? true,        notificheEmail: data.notificheEmail ?? true,        reminderOre: data.reminderOre ?? 24,        tema: data.tema ?? 'system',        lingua: data.lingua ?? 'it',      };      this.docente = data;    } catch (err) {      console.error('Errore caricamento profilo', err);      await this.showToast('Errore nel caricamento del profilo');    } finally {      this.loading = false;    }  }  async salvaModifiche() {    try {      const user = this.authService.getCurrentUser();      if (!user) return;      await firstValueFrom(this.docenteService.aggiornaProfilo(user.id, this.form));      this.authService.updateUser({        nome: this.form.nome,        cognome: this.form.cognome      });      await this.showToast('Profilo aggiornato con successo!');    } catch (err) {      console.error(err);      await this.showToast('Errore durante aggiornamento profilo');    }  }    async apriCambioPassword() {
    this.isCambioPasswordAperto = !this.isCambioPasswordAperto;
    this.formPassword = { vecchiaPw: '', nuovaPw: '', confermaPw: '' };
  }
  async handleCambioPassword() {
    const data = this.formPassword;
    if (!data.vecchiaPw || !data.nuovaPw || !data.confermaPw) {
      await this.showToast('Compila tutti i campi');
      return;
    }    if (data.nuovaPw !== data.confermaPw) {      await this.showToast('Le password non coincidono');      return;    }    if (data.nuovaPw == data.vecchiaPw) {      await this.showToast('La nuova password è uguale a quella vecchia');      return;    }        try {
      const res = await firstValueFrom(
        this.authService.changePassword(data.vecchiaPw, data.nuovaPw)
      );
      this.isCambioPasswordAperto = false;
      this.formPassword = { vecchiaPw: '', nuovaPw: '', confermaPw: '' };
      await this.showToast(res.messaggio || 'Password aggiornata');    } catch (err: any) {      await this.showToast(err.error?.error || 'Errore nel cambio password', 'danger');    }  }  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {    const toast = await this.toastCtrl.create({      message,      duration: 2000,      color,      position: 'top'    });    await toast.present();  }  logout() {    this.authService.logout();    this.router.navigate(['/login']);  }}
