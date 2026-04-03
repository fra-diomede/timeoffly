import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../services/notification.service';

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
}
