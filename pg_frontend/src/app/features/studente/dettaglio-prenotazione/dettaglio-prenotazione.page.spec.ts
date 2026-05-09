import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DettaglioPrenotazionePage } from './dettaglio-prenotazione.page';

describe('DettaglioPrenotazionePage', () => {
  let component: DettaglioPrenotazionePage;
  let fixture: ComponentFixture<DettaglioPrenotazionePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DettaglioPrenotazionePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
