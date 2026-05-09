import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotifichePage } from './notifiche.page';

describe('NotifichePage', () => {
  let component: NotifichePage;
  let fixture: ComponentFixture<NotifichePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifichePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
