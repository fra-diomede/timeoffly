import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { finalize, Observable } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { AuthSession } from '../models/auth.model';
import { BrandLockupComponent } from '../components/brand-lockup/brand-lockup.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    BrandLockupComponent
  ],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss']
})
export class AppShellComponent {
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'space_dashboard' },
    { label: 'Ferie', route: '/ferie', icon: 'event_available' },
    { label: 'Permessi 104', route: '/permessi-104', icon: 'volunteer_activism' },
    { label: 'Calendario', route: '/calendario', icon: 'calendar_month' },
    { label: 'Team', route: '/team', icon: 'groups', roles: ['MANAGER', 'ADMIN'] },
    { label: 'Approvazioni', route: '/approvals', icon: 'verified', roles: ['MANAGER', 'ADMIN'] },
    { label: 'Amministrazione', route: '/admin', icon: 'admin_panel_settings', roles: ['ADMIN'] }
  ];

  readonly profileItem: NavItem = { label: 'Profilo', route: '/profilo', icon: 'account_circle' };

  user$: Observable<AuthSession | null>;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.session$;
  }

  hasAccess(item: NavItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return this.authService.hasAnyRole(item.roles);
  }

  logout() {
    this.authService
      .logout()
      .pipe(
        finalize(() => {
          this.authService.redirectToLogin();
        })
      )
      .subscribe();
  }

  displayName(user: AuthSession | null): string {
    if (!user) return '';
    const nome = user.nome?.trim() ?? '';
    const cognome = user.cognome?.trim() ?? '';
    const fullName = [nome, cognome].filter(Boolean).join(' ');
    return fullName || user.username;
  }
}
