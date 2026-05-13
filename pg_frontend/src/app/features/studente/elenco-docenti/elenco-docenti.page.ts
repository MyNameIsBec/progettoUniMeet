import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { DashboardLayoutComponent } from '../../../components/dashboard-layout/dashboard-layout.component';
import { Docente } from '../../../core/models/interfacce';

@Component({
  selector: 'app-elenco-docenti',
  templateUrl: './elenco-docenti.page.html',
  styleUrls: ['./elenco-docenti.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonSelect,
    IonSelectOption,
    DashboardLayoutComponent
  ]
})
export class ElencoDocentiPage {
  public listaDocenti: Docente[] = [];

  constructor() {
  }
}