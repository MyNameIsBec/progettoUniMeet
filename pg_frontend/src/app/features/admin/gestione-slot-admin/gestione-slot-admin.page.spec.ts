import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestioneSlotAdminPage } from './gestione-slot-admin.page';

describe('GestioneSlotAdminPage', () => {
  let component: GestioneSlotAdminPage;
  let fixture: ComponentFixture<GestioneSlotAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestioneSlotAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
