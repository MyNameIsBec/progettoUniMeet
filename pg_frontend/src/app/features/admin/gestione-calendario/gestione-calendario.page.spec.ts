import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestioneCalendarioPage } from './gestione-calendario.page';

xdescribe('GestioneCalendarioPage', () => {
  let component: GestioneCalendarioPage;
  let fixture: ComponentFixture<GestioneCalendarioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestioneCalendarioPage]
    }).compileComponents();

    fixture = TestBed.createComponent(GestioneCalendarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
