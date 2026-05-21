import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BachecheDocentePage } from './bacheche-docente.page';

describe('BachecheDocentePage', () => {
  let component: BachecheDocentePage;
  let fixture: ComponentFixture<BachecheDocentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BachecheDocentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
