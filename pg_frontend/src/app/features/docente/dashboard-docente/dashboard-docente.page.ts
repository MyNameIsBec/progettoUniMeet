import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonRouterOutlet, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-dashboard-docente',
  templateUrl: './dashboard-docente.page.html',
  styleUrls: ['./dashboard-docente.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonRouterOutlet, CommonModule, FormsModule]
})
export class DashboardDocentePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
