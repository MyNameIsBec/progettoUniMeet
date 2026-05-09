import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfiloDocentePage } from './profilo-docente.page';

describe('ProfiloDocentePage', () => {
  let component: ProfiloDocentePage;
  let fixture: ComponentFixture<ProfiloDocentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfiloDocentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
