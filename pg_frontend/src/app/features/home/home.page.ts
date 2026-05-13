
import { Component, ViewChild, AfterViewInit, ChangeDetectorRef, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonButton, IonIcon, IonCard, IonCardContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonContent, IonButton, IonIcon, IonCard, IonCardContent, IonGrid, IonRow, IonCol]
})

export class HomePage implements AfterViewInit {
  @ViewChild(IonContent, { static: true }) content?: IonContent;

  activeSection: string = 'home';

  private cdr = inject(ChangeDetectorRef);

  constructor() {
  }


  ngAfterViewInit() {
    const sections = document.querySelectorAll('section[id]');
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
            this.cdr.detectChanges();
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach((s) => observer.observe(s));
  }

  async scrollToSection(event: Event, sectionId: string) {
    event.preventDefault();
    this.activeSection = sectionId;

    const section = document.getElementById(sectionId);
    if (!section || !this.content) {
      return;
    }

    const top = section.offsetTop - 80;
    await this.content.scrollToPoint(0, top > 0 ? top : 0, 400);

  }
}