import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestioneAccountPage } from './gestione-account.page';

describe('GestioneAccountPage', () => {
  let component: GestioneAccountPage;
  let fixture: ComponentFixture<GestioneAccountPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestioneAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
