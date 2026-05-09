import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BachecaStudentePage } from './bacheca-studente.page';

describe('BachecaStudentePage', () => {
  let component: BachecaStudentePage;
  let fixture: ComponentFixture<BachecaStudentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BachecaStudentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
