import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionePrenotazioniAdminPage } from './gestione-prenotazioni-admin.page';

xdescribe('GestionePrenotazioniAdminPage', () => {
  let component: GestionePrenotazioniAdminPage;
  let fixture: ComponentFixture<GestionePrenotazioniAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionePrenotazioniAdminPage]
    }).compileComponents();

    fixture = TestBed.createComponent(GestionePrenotazioniAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
