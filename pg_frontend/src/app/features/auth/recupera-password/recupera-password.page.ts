import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-recupera-password',
  templateUrl: './recupera-password.page.html',
  styleUrls: ['./recupera-password.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RecuperaPasswordPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
