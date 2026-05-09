import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfiloStudentePage } from './profilo-studente.page';

describe('ProfiloStudentePage', () => {
  let component: ProfiloStudentePage;
  let fixture: ComponentFixture<ProfiloStudentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfiloStudentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
