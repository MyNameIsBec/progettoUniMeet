import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormPrenotazionePage } from './form-prenotazione.page';

describe('FormPrenotazionePage', () => {
  let component: FormPrenotazionePage;
  let fixture: ComponentFixture<FormPrenotazionePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPrenotazionePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
