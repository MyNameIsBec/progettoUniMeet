import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestioneSlotPage } from './gestione-slot.page';

describe('GestioneSlotPage', () => {
  let component: GestioneSlotPage;
  let fixture: ComponentFixture<GestioneSlotPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestioneSlotPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
