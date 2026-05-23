import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestioneSegnalazioniPage } from './gestione-segnalazioni.page';

xdescribe('GestioneSegnalazioniPage', () => {
  let component: GestioneSegnalazioniPage;
  let fixture: ComponentFixture<GestioneSegnalazioniPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestioneSegnalazioniPage]
    }).compileComponents();

    fixture = TestBed.createComponent(GestioneSegnalazioniPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
