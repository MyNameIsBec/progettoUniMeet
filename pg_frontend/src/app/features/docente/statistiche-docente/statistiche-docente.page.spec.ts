import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatisticheDocentePage } from './statistiche-docente.page';

describe('StatisticheDocentePage', () => {
  let component: StatisticheDocentePage;
  let fixture: ComponentFixture<StatisticheDocentePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticheDocentePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
