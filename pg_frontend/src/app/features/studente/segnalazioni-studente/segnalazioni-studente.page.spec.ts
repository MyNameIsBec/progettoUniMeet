import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SegnalazioniStudentePage } from './segnalazioni-studente.page';

describe('SegnalazioniStudentePage', () => {
  let component: SegnalazioniStudentePage;
  let fixture: ComponentFixture<SegnalazioniStudentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SegnalazioniStudentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
