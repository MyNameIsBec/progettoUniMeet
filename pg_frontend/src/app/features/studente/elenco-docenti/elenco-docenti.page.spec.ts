import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElencoDocentiPage } from './elenco-docenti.page';

describe('ElencoDocentiPage', () => {
  let component: ElencoDocentiPage;
  let fixture: ComponentFixture<ElencoDocentiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ElencoDocentiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
