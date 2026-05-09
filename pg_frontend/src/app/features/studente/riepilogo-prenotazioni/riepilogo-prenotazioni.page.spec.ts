import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RiepilogoPrenotazioniPage } from './riepilogo-prenotazioni.page';

describe('RiepilogoPrenotazioniPage', () => {
  let component: RiepilogoPrenotazioniPage;
  let fixture: ComponentFixture<RiepilogoPrenotazioniPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RiepilogoPrenotazioniPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
