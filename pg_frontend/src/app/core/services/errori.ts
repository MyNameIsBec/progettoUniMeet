import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ErroriService {

  constructor(private toastController: ToastController) { }

  private messaggioDaErrore(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Errore di connessione al server';
    if (err.status === 400) return err.error?.error || err.error?.errors?.[0]?.msg || 'Dati non validi';
    if (err.status === 401) return err.error?.error || 'Sessione scaduta. Effettua il login';
    if (err.status === 403) return 'Accesso negato';
    if (err.status === 404) return 'Risorsa non trovata';
    if (err.status === 409) return err.error?.error || 'Conflitto con dati esistenti';
    if (err.status >= 500) return 'Errore interno del server';
    return 'Errore sconosciuto';
  }

  async gestoreErrori(err: HttpErrorResponse): Promise<void> {
    const msg = this.messaggioDaErrore(err);
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }

  async mostraSuccesso(msg: string): Promise<void> {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      color: 'success',
      position: 'top',
    });
    await toast.present();
  }

  async mostraAvviso(msg: string): Promise<void> {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      color: 'warning',
      position: 'top',
    });
    await toast.present();
  }
}
