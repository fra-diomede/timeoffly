import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationBanner, NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [AsyncPipe, NgIf, MatButtonModule, MatIconModule],
  templateUrl: './notification-banner.component.html',
  styleUrls: ['./notification-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationBannerComponent {
  private readonly notifications = inject(NotificationService);
  readonly banner$ = this.notifications.banner$;

  dismiss() {
    this.notifications.dismiss();
  }

  getIcon(level: NotificationBanner['level']) {
    return level === 'success' ? 'check_circle' : 'error';
  }

  getEyebrow(level: NotificationBanner['level']) {
    return level === 'success' ? 'Successo' : 'Errore';
  }

  getRole(level: NotificationBanner['level']) {
    return level === 'success' ? 'status' : 'alert';
  }

  getAriaLive(level: NotificationBanner['level']) {
    return level === 'success' ? 'polite' : 'assertive';
  }

  getDismissLabel(level: NotificationBanner['level']) {
    return level === 'success' ? 'Chiudi messaggio di successo' : 'Chiudi messaggio di errore';
  }
}
