import { Component } from '@angular/core';
import { NgForOf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { NotificationService } from '../../core/services/notification.service';
import { FerieService } from '../../services/ferie.service';

@Component({
  selector: 'app-ferie-form',
  templateUrl: './ferie-form.component.html',
  styleUrls: ['./ferie-form.component.scss'],
  imports: [
    MatOption,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    ReactiveFormsModule,
    MatInput,
    MatButton,
    NgForOf,
    MatLabel,
    MatFormField,
    MatNativeDateModule,
    MatSelectModule
  ]
})
export class FerieFormComponent {
  ferieForm: FormGroup;
  tipi = ['Ferie', 'ROL', 'Malattia', 'Donazione Sangue', 'Permesso Studio', 'Permesso 104', 'Altro'];

  constructor(
    private fb: FormBuilder,
    private ferieService: FerieService,
    private notifications: NotificationService
  ) {
    this.ferieForm = this.fb.group({
      Nome: ['', Validators.required],
      Cognome: ['', Validators.required],
      'Data Inizio': ['', Validators.required],
      'Data Fine': ['', Validators.required],
      Tipo: ['Ferie', Validators.required],
      Note: ['']
    });
  }

  submit() {
    if (this.ferieForm.valid) {
      const formData = {
        ...this.ferieForm.value,
        'Data Inizio': this.ferieForm.value['Data Inizio'].toISOString().split('T')[0],
        'Data Fine': this.ferieForm.value['Data Fine'].toISOString().split('T')[0]
      };

      this.ferieService.addFerie(formData).subscribe({
        next: () => {
          this.notifications.success('Ferie inserite correttamente');
          this.ferieForm.reset({ Tipo: 'Ferie' });
        }
      });
    }
  }
}
