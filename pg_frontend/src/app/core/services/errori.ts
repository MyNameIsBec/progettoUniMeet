import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ErroriService {

  constructor(private toastController: ToastController) { }
  async gestoreErrori(err: HttpErrorResponse): Promise<void> {
    let msg = "Errore sconosciuto";

    if (err.status == 0) {
      msg = "Errore di connessione al server";
    } else if (err.status == 400) {
      msg = err.error?.error || err.error?.errors?.[0]?.msg || "Dati non validi";
    } else if (err.status == 401) {
      msg = err.error?.error || "Sessione scaduta. Effettua il login";
    } else if (err.status == 403) {
      msg = "Accesso negato";
    } else if (err.status == 404) {
      msg = "Risorsa non trovata";
    } else if (err.status == 500) {
      msg = "Errore interno del server";
    }

    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      color: "danger",
      position: "top",
    });
    await toast.present();
  }
}
