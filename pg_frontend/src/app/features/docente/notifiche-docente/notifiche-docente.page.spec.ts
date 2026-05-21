import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificheDocentePage } from './notifiche-docente.page';

describe('NotificheDocentePage', () => {
  let component: NotificheDocentePage;
  let fixture: ComponentFixture<NotificheDocentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificheDocentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
