import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { FerieService } from '../../services/ferie.service';
import { FerieFormComponent } from './ferie-form.component';

describe('FerieFormComponent', () => {
  let component: FerieFormComponent;
  let fixture: ComponentFixture<FerieFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FerieFormComponent],
      providers: [
        {
          provide: FerieService,
          useValue: {
            addFerie: () => of({})
          }
        },
        {
          provide: NotificationService,
          useValue: {
            success: jasmine.createSpy('success')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FerieFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
