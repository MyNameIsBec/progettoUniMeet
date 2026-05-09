import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IndicatoreRiempimentoComponent } from './indicatore-riempimento.component';

describe('IndicatoreRiempimentoComponent', () => {
  let component: IndicatoreRiempimentoComponent;
  let fixture: ComponentFixture<IndicatoreRiempimentoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IndicatoreRiempimentoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IndicatoreRiempimentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
