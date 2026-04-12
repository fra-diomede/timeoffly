import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroMesiComponent } from './ferie-filtri.component';

describe('FiltroMesiComponent', () => {
  let component: FiltroMesiComponent;
  let fixture: ComponentFixture<FiltroMesiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroMesiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltroMesiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
