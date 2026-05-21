import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { VoceMenuNavigazione } from '../../core/models/interfacce';
import { AuthService } from '../../core/services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonIcon]
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Input() vociMenuMobile: VoceMenuNavigazione[] = [];

  nomeUtente: string = '';
  ruoloUtente: string = ' ';
  menuAperto = false;
  isDarkMode = false;

  private userSub: Subscription | null = null;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.isDarkMode = document.body.classList.contains('dark');
    this.userSub = this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.nomeUtente = `${user.nome} ${user.cognome}`;
        this.ruoloUtente = user.role;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  toggleMenu() {
    this.menuAperto = !this.menuAperto;
  }

  chiudiMenu() {
    this.menuAperto = false;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private getProfileRoute(): string {
    switch (this.ruoloUtente) {
      case 'amministratore': return '/dashboard-admin';
      case 'docente': return '/profilo-docente';
      default: return '/profilo-studente';
    }
  }

  getNotificheRoute(): string {
    switch (this.ruoloUtente) {
      case 'docente': return '/notifiche-docente';
      default: return '/notifiche-studente';
    }
  }

  vaiAlProfilo() {
    this.router.navigate([this.getProfileRoute()]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
