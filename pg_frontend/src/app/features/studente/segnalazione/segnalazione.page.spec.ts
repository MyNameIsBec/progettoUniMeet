import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SegnalazionePage } from './segnalazione.page';

describe('SegnalazionePage', () => {
  let component: SegnalazionePage;
  let fixture: ComponentFixture<SegnalazionePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SegnalazionePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
