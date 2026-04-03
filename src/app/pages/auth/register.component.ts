import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { BrandLockupComponent } from '../../components/brand-lockup/brand-lockup.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    BrandLockupComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  loading = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notifications: NotificationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contratto: ['', Validators.required],
      giorniTotali: [null, [Validators.required, Validators.min(0)]],
      oreTotali: [null, [Validators.required, Validators.min(0)]],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.loading) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { nome, cognome, username, email, contratto, giorniTotali, oreTotali, password } = this.form.getRawValue();
    this.authService
      .register({
        nome: nome ?? '',
        cognome: cognome ?? '',
        username: username ?? '',
        email: email ?? '',
        contratto: contratto ?? '',
        giorniTotali: typeof giorniTotali === 'number' ? giorniTotali : Number(giorniTotali ?? 0),
        oreTotali: typeof oreTotali === 'number' ? oreTotali : Number(oreTotali ?? 0),
        password: password ?? ''
      })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: () => {
          this.notifications.success('Registrazione completata. Ora puoi accedere.');
          void this.router.navigate(['/auth/login']);
        }
      });
  }

  shouldShowError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control?.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Campo obbligatorio';
    }

    if (control.hasError('email')) {
      return 'Controlla i dati inseriti';
    }

    if (control.hasError('min')) {
      return 'Inserisci un valore uguale o superiore a 0';
    }

    return 'Controlla i dati inseriti';
  }
}
