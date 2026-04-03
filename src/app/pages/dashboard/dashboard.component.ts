import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardDto } from '../../models/dashboard.model';
import { parseItalianDate, toItalianDate } from '../../core/utils/date.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  year = new Date().getFullYear();
  loading = false;
  data?: DashboardDto;
  breakdown: { label: string; value: number }[] = [];
  welcomeName = '';

  constructor(private dashboardService: DashboardService, private authService: AuthService) {}

  ngOnInit() {
    this.setWelcomeName();
    this.load();
  }

  load() {
    const user = this.authService.getSession()?.username;
    if (!user) return;
    this.loading = true;
    this.dashboardService
      .getDashboard(user, this.year)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: data => {
          this.data = data;
          this.breakdown = this.mapBreakdown(data);
        }
      });
  }

  formatDate(value?: string) {
    if (!value) return '-';
    const parsed = parseItalianDate(value);
    return parsed ? toItalianDate(parsed) : toItalianDate(value);
  }

  private mapBreakdown(data: DashboardDto) {
    const breakdown = data.statistiche?.breakdownPerTipologia ?? {};
    const entries = Object.entries(breakdown)
      .filter(([key]) => key && key !== '[object Object]')
      .map(([key, value]) => ({ label: key, value: value as number }));
    return entries;
  }

  private setWelcomeName() {
    const session = this.authService.getSession();
    const nome = session?.nome?.trim();
    const cognome = session?.cognome?.trim();
    if (nome && cognome) {
      this.welcomeName = `${nome} ${cognome}`;
      return;
    }
    this.welcomeName = session?.username ?? '';
  }
}
