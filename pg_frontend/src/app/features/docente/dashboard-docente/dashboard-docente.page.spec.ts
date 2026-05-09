import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardDocentePage } from './dashboard-docente.page';

describe('DashboardDocentePage', () => {
  let component: DashboardDocentePage;
  let fixture: ComponentFixture<DashboardDocentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDocentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
