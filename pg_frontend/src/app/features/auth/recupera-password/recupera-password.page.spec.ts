import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecuperaPasswordPage } from './recupera-password.page';

describe('RecuperaPasswordPage', () => {
  let component: RecuperaPasswordPage;
  let fixture: ComponentFixture<RecuperaPasswordPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecuperaPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
