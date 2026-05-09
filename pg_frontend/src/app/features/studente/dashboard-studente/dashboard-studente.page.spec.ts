import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardStudentePage } from './dashboard-studente.page';

describe('DashboardStudentePage', () => {
  let component: DashboardStudentePage;
  let fixture: ComponentFixture<DashboardStudentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardStudentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
