import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificheStudentePage } from './notifiche-studente.page';

describe('NotificheStudentePage', () => {
  let component: NotificheStudentePage;
  let fixture: ComponentFixture<NotificheStudentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificheStudentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
