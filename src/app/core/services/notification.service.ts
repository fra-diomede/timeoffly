import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface NotificationOptions {
  actionLabel?: string;
  dedupeKey?: string;
  durationMs?: number;
  dismissOnNavigation?: boolean;
  suppressDuplicates?: boolean;
}

export interface NotificationBanner {
  dismissOnNavigation: boolean;
  level: NotificationLevel;
  message: string;
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
  private readonly bannerSubject = new BehaviorSubject<NotificationBanner | null>(null);
  private bannerTimerId: number | null = null;
  private lastNotification: NotificationState | null = null;

  readonly banner$ = this.bannerSubject.asObservable();

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events
        .pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
        .subscribe(() => this.handleNavigationStart());
    }
  }

  success(message: string, options?: NotificationOptions) {
    this.openBanner(message, 'success', {
      ...options,
      dismissOnNavigation: options?.dismissOnNavigation ?? false,
      durationMs: options?.durationMs ?? this.defaultDurationMs
    });
  }

  error(message: string, options?: NotificationOptions) {
    this.openBanner(message, 'error', {
      ...options,
      dismissOnNavigation: options?.dismissOnNavigation ?? true
    });
  }

  info(message: string, options?: NotificationOptions) {
    this.dismiss();
    this.openSnack(message, 'info', options);
  }

  dismiss() {
    this.clearBanner();
    this.snackBar.dismiss();
    this.lastNotification = null;
  }

  private openBanner(message: string, level: NotificationLevel, options?: NotificationOptions) {
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

    this.snackBar.dismiss();
    this.clearBannerTimer();

    this.lastNotification = {
      key: dedupeKey,
      timestamp: Date.now()
    };

    this.bannerSubject.next({
      dismissOnNavigation: options?.dismissOnNavigation ?? true,
      level,
      message: normalizedMessage
    });

    const durationMs = options?.durationMs ?? null;
    if (durationMs && durationMs > 0) {
      this.bannerTimerId = window.setTimeout(() => {
        this.clearBanner();
      }, durationMs);
    }
  }

  private openSnack(message: string, level: NotificationLevel, options?: NotificationOptions) {
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

  private handleNavigationStart() {
    this.snackBar.dismiss();

    if (this.bannerSubject.value?.dismissOnNavigation === false) {
      return;
    }

    this.clearBanner();
  }

  private clearBanner() {
    this.clearBannerTimer();
    this.bannerSubject.next(null);
  }

  private clearBannerTimer() {
    if (this.bannerTimerId === null) {
      return;
    }

    window.clearTimeout(this.bannerTimerId);
    this.bannerTimerId = null;
  }

  private normalizeMessage(message: unknown): string | null {
    if (typeof message !== 'string') {
      return null;
    }

    const normalized = message.trim();
    return normalized ? normalized : null;
  }
}
