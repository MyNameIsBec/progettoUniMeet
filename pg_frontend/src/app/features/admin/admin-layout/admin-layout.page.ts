import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  IonHeader, IonTitle, IonToolbar, IonContent,
  IonSegment, IonSegmentButton,
  IonLabel, IonRouterOutlet,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.page.html',
  styleUrls: ['./admin-layout.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonTitle, IonToolbar, IonContent,
    IonSegment, IonSegmentButton,
    IonLabel, IonRouterOutlet,
    CommonModule,
  ],
})
export class AdminLayoutPage implements OnDestroy {
  activeSegment = 'dashboard';
  pageTitle = 'Dashboard Admin';
  private routerSub: Subscription;

  constructor(private router: Router) {
    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.syncFromRoute());
    this.syncFromRoute();
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  private syncFromRoute() {
    const path = this.router.url;
    if (path.includes('gestione-utenti')) {
      this.activeSegment = 'utenti';
      this.pageTitle = 'Gestione Utenti';
    } else if (path.includes('gestione-slot-admin')) {
      this.activeSegment = 'slot';
      this.pageTitle = 'Gestione Slot';
    } else {
      this.activeSegment = 'dashboard';
      this.pageTitle = 'Dashboard Admin';
    }
  }

  onSegmentChange(event: any) {
    const value = event.detail.value;
    if (value === 'dashboard') this.router.navigateByUrl('/dashboard-admin/dashboard');
    else if (value === 'utenti') this.router.navigateByUrl('/dashboard-admin/gestione-utenti');
    else if (value === 'slot') this.router.navigateByUrl('/dashboard-admin/gestione-slot-admin');
  }
}
