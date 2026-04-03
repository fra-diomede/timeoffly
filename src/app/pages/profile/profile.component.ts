import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ProfiloService } from '../../core/services/profilo.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthSession } from '../../models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  session: AuthSession | null;

  changeForm: FormGroup;

  deletePassword = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profiloService: ProfiloService,
    private notifications: NotificationService
  ) {
    this.session = this.authService.getSession();
    this.changeForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmNewPassword: ['', Validators.required]
    });
  }

  get displayName() {
    const nome = this.session?.nome?.trim() ?? '';
    const cognome = this.session?.cognome?.trim() ?? '';
    const fullName = [nome, cognome].filter(Boolean).join(' ');
    return fullName || this.session?.username || 'Profilo utente';
  }

  get initials() {
    return this.displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  get rolesLabel() {
    return this.session?.ruoli?.join(', ') || 'Utente';
  }

  changePassword() {
    if (!this.session?.username || this.changeForm.invalid) return;
    const { currentPassword, newPassword, confirmNewPassword } = this.changeForm.getRawValue();
    if (newPassword !== confirmNewPassword) {
      this.notifications.error('Le password non coincidono');
      return;
    }
    this.profiloService
      .changePassword(this.session.username, {
        currentPassword: currentPassword ?? '',
        newPassword: newPassword ?? '',
        confirmNewPassword: confirmNewPassword ?? ''
      })
      .subscribe({
        next: () => {
          this.notifications.success('Password aggiornata');
          this.changeForm.reset();
        }
      });
  }

  deleteAccount() {
    if (!this.session?.username || !this.deletePassword) return;
    this.profiloService.delete(this.session.username, this.deletePassword).subscribe({
      next: () => {
        this.notifications.success('Account eliminato');
        this.authService
          .logout()
          .pipe(
            finalize(() => {
              this.authService.redirectToLogin();
            })
          )
          .subscribe();
      }
    });
  }
}
