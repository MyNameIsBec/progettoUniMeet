import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentiDocentePage } from './documenti-docente.page';

describe('DocumentiDocentePage', () => {
  let component: DocumentiDocentePage;
  let fixture: ComponentFixture<DocumentiDocentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentiDocentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
