import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestioneUtentiPage } from './gestione-utenti.page';

describe('GestioneUtentiPage', () => {
  let component: GestioneUtentiPage;
  let fixture: ComponentFixture<GestioneUtentiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestioneUtentiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
