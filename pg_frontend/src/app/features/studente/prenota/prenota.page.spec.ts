import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrenotaPage } from './prenota.page';

describe('PrenotaPage', () => {
  let component: PrenotaPage;
  let fixture: ComponentFixture<PrenotaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrenotaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
