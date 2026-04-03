import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface NotificationOptions {
  actionLabel?: string;
  dedupeKey?: string;
  durationMs?: number;
  suppressDuplicates?: boolean;
}

type NotificationLevel = 'success' | 'error' | 'info';

interface NotificationState {
  key: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly defaultDurationMs = 4000;
  private readonly dedupeWindowMs = 1500;
  private lastNotification: NotificationState | null = null;

  constructor(
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  success(message: string, options?: NotificationOptions) {
    this.open(message, 'success', options);
  }

  error(message: string, options?: NotificationOptions) {
    this.open(message, 'error', options);
  }

  info(message: string, options?: NotificationOptions) {
    this.open(message, 'info', options);
  }

  private open(message: string, level: NotificationLevel, options?: NotificationOptions) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const normalizedMessage = this.normalizeMessage(message);
    if (!normalizedMessage) {
      return;
    }

    const dedupeKey = options?.dedupeKey ?? `${level}:${normalizedMessage}`;
    const suppressDuplicates = options?.suppressDuplicates ?? true;
    if (suppressDuplicates && this.isDuplicate(dedupeKey)) {
      return;
    }

    this.lastNotification = {
      key: dedupeKey,
      timestamp: Date.now()
    };

    this.snackBar.dismiss();
    this.snackBar.open(normalizedMessage, options?.actionLabel ?? 'Chiudi', {
      duration: options?.durationMs ?? this.defaultDurationMs,
      horizontalPosition: 'end',
      panelClass: [`toast-${level}`],
      verticalPosition: 'top'
    });
  }

  private isDuplicate(key: string): boolean {
    return !!this.lastNotification && this.lastNotification.key === key && Date.now() - this.lastNotification.timestamp < this.dedupeWindowMs;
  }

  private normalizeMessage(message: unknown): string | null {
    if (typeof message !== 'string') {
      return null;
    }

    const normalized = message.trim();
    return normalized ? normalized : null;
  }
}
