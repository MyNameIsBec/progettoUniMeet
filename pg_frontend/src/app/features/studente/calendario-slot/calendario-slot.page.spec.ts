import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarioSlotPage } from './calendario-slot.page';

describe('CalendarioSlotPage', () => {
  let component: CalendarioSlotPage;
  let fixture: ComponentFixture<CalendarioSlotPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarioSlotPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
