import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BachecaDocentePage } from './bacheca-docente.page';

describe('BachecaDocentePage', () => {
  let component: BachecaDocentePage;
  let fixture: ComponentFixture<BachecaDocentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BachecaDocentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
