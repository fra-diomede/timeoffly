import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { isValid, parseISO } from 'date-fns';
import { finalize, merge } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Permessi104Service } from '../../core/services/permessi104.service';
import { toIsoDate } from '../../core/utils/date.util';
import {
  buildPermessi104DashboardData,
  getEffectiveStartDate,
  validatePermesso104Usage
} from './permessi-104.logic';
import {
  Permesso104Assistito,
  Permesso104Config,
  Permesso104ConfigDto,
  Permesso104Mode,
  Permesso104MonthAnalytics,
  Permessi104DashboardData,
  Permesso104Usage,
  Permesso104UsageDraft
} from './permessi-104.models';

@Component({
  selector: 'app-permessi-104',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './permessi-104.component.html',
  styleUrls: ['./permessi-104.component.scss']
})
export class Permessi104Component implements OnInit {
  readonly parentelaOptions = [
    'Coniuge',
    'Genitore',
    'Figlio/a',
    'Fratello/Sorella',
    'Parente affine',
    'Altro'
  ];
  readonly today = new Date();
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly permessi104Service = inject(Permessi104Service);

  readonly configForm = this.fb.group({
    dataAccettazione: this.fb.control<Date | null>(null, Validators.required),
    dataInizioFruizione: this.fb.control<Date | null>(null, Validators.required),
    protocollo: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(40)] }),
    gradoParentela: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    modalitaFruizione: this.fb.control<Permesso104Mode>('GIORNI', { nonNullable: true, validators: [Validators.required] }),
    oreSettimanali: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    giorniLavorativiSettimanali: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(7)])
  });

  readonly assistitoForm = this.fb.group({
    nome: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    gradoParentela: this.fb.control('', { nonNullable: true, validators: [Validators.required] })
  });

  readonly usageForm = this.fb.group({
    data: this.fb.control<Date | null>(null, Validators.required),
    ore: this.fb.control<number | null>(null)
  });

  assistiti: Permesso104Assistito[] = [];
  usages: Permesso104Usage[] = [];
  dashboardData: Permessi104DashboardData = buildPermessi104DashboardData(this.configSnapshot, []);
  loadingConfig = false;
  savedConfig: Permesso104ConfigDto | null = null;
  savingConfig = false;
  usageAlertMessage = '';
  usageDateMessage = '';
  usageWarningMessage = '';
  private sequence = 0;

  constructor() {
    this.syncUsageValidators(this.currentMode);

    this.configForm.controls.modalitaFruizione.valueChanges
      .pipe(startWith(this.currentMode), takeUntilDestroyed(this.destroyRef))
      .subscribe(mode => {
        this.syncUsageValidators(mode);
        this.recalculate();
      });

    merge(this.configForm.valueChanges, this.usageForm.valueChanges)
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.recalculate();
        this.refreshUsageMessages();
      });
  }

  ngOnInit(): void {
    this.loadConfig();
  }

  get currentMode(): Permesso104Mode {
    return this.configForm.controls.modalitaFruizione.value;
  }

  get currentMonth(): Permesso104MonthAnalytics {
    return this.dashboardData.currentMonth;
  }

  get effectiveStartDate(): Date | null {
    return getEffectiveStartDate(this.configSnapshot);
  }

  get isHourlyMode(): boolean {
    return this.currentMode === 'ORE';
  }

  get currentAvailabilityLabel(): string {
    return this.buildAvailabilityLabel(this.currentMonth.remainingDays, this.currentMonth.remainingHours);
  }

  get currentUserId(): string | null {
    return this.authService.getSession()?.username ?? null;
  }

  addAssistito(): void {
    if (this.assistitoForm.invalid) {
      this.assistitoForm.markAllAsTouched();
      return;
    }

    this.assistiti = [
      ...this.assistiti,
      {
        id: this.nextId('assistito'),
        nome: this.assistitoForm.controls.nome.value.trim(),
        gradoParentela: this.assistitoForm.controls.gradoParentela.value
      }
    ];
    this.assistitoForm.reset({
      nome: '',
      gradoParentela: this.configForm.controls.gradoParentela.value
    });
  }

  removeAssistito(id: string): void {
    this.assistiti = this.assistiti.filter(assistito => assistito.id !== id);
  }

  addUsage(): void {
    this.refreshUsageMessages();

    if (this.usageForm.invalid || this.configForm.invalid) {
      this.usageForm.markAllAsTouched();
      this.configForm.markAllAsTouched();
      return;
    }

    const validation = validatePermesso104Usage(this.configSnapshot, this.usages, this.usageDraft, this.today);
    if (validation.isBeforeEffectiveStart || validation.exceedsMonthlyLimit) {
      this.usageForm.markAllAsTouched();
      return;
    }

    const rawDate = this.usageForm.controls.data.value;
    if (!rawDate) {
      return;
    }

    this.usages = [...this.usages, {
      id: this.nextId('usage'),
      data: rawDate,
      modalita: this.currentMode,
      ore: this.isHourlyMode ? this.usageForm.controls.ore.value : null
    }].sort((left, right) => left.data.getTime() - right.data.getTime());

    this.usageForm.reset({
      data: null,
      ore: null
    });
    this.recalculate();
    this.refreshUsageMessages();
  }

  removeUsage(id: string): void {
    this.usages = this.usages.filter(entry => entry.id !== id);
    this.recalculate();
    this.refreshUsageMessages();
  }

  saveConfiguration(): void {
    const userId = this.currentUserId;
    if (!userId) {
      this.notificationService.error('Utente non disponibile per il salvataggio della configurazione 104');
      return;
    }

    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }

    this.savingConfig = true;
    this.permessi104Service
      .saveConfig(this.toDto(userId))
      .pipe(
        finalize(() => {
          this.savingConfig = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.savedConfig = response;
          this.applySavedConfig(response);
          this.notificationService.success('Configurazione 104 salvata correttamente');
        },
        error: () => {
          this.notificationService.error('Salvataggio configurazione 104 non riuscito');
        }
      });
  }

  formatDate(value: Date | null): string {
    if (!value) {
      return '-';
    }

    return value.toLocaleDateString('it-IT');
  }

  formatDayValue(value: number): string {
    return `${this.formatNumber(value)} gg`;
  }

  formatHourValue(value: number): string {
    return `${this.formatNumber(value)} h`;
  }

  formatUsageValue(days: number, hours: number): string {
    return this.isHourlyMode ? this.formatHourValue(hours) : this.formatDayValue(days);
  }

  formatSecondaryUsage(days: number, hours: number): string {
    return this.isHourlyMode ? `Equivalente ${this.formatDayValue(days)}` : `Equivalente ${this.formatHourValue(hours)}`;
  }

  usageQuantityLabel(entry: Permesso104Usage): string {
    return entry.modalita === 'ORE' ? this.formatHourValue(entry.ore ?? 0) : this.formatDayValue(1);
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  private get configSnapshot(): Permesso104Config {
    return {
      dataAccettazione: this.configForm.controls.dataAccettazione.value,
      dataInizioFruizione: this.configForm.controls.dataInizioFruizione.value,
      protocollo: this.configForm.controls.protocollo.value,
      gradoParentela: this.configForm.controls.gradoParentela.value,
      modalitaFruizione: this.currentMode,
      oreSettimanali: this.configForm.controls.oreSettimanali.value,
      giorniLavorativiSettimanali: this.configForm.controls.giorniLavorativiSettimanali.value
    };
  }

  private get usageDraft(): Permesso104UsageDraft {
    return {
      data: this.usageForm.controls.data.value,
      modalita: this.currentMode,
      ore: this.usageForm.controls.ore.value
    };
  }

  private loadConfig(): void {
    const userId = this.currentUserId;
    if (!userId) {
      this.resetConfigForm();
      return;
    }

    this.loadingConfig = true;
    this.permessi104Service
      .getConfig(userId)
      .pipe(
        finalize(() => {
          this.loadingConfig = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.savedConfig = response;
          if (response) {
            this.applySavedConfig(response);
            return;
          }

          this.resetConfigForm();
        },
        error: () => {
          this.resetConfigForm();
          this.notificationService.error('Caricamento configurazione 104 non riuscito');
        }
      });
  }

  private nextId(prefix: string): string {
    this.sequence += 1;
    return `${prefix}-${this.sequence}`;
  }

  private recalculate(): void {
    this.dashboardData = buildPermessi104DashboardData(this.configSnapshot, this.usages, this.today);
  }

  private syncUsageValidators(mode: Permesso104Mode): void {
    const oreControl = this.usageForm.controls.ore;

    if (mode === 'ORE') {
      oreControl.setValidators([Validators.required, Validators.min(0.1)]);
    } else {
      oreControl.clearValidators();
      oreControl.setValue(null, { emitEvent: false });
    }

    oreControl.updateValueAndValidity({ emitEvent: false });
  }

  private refreshUsageMessages(): void {
    const draftDate = this.usageForm.controls.data.value;
    const referenceMonth = draftDate
      ? this.dashboardData.monthlyAnalytics.find(month => month.monthDate.getFullYear() === draftDate.getFullYear() && month.monthDate.getMonth() === draftDate.getMonth()) ??
        this.currentMonth
      : this.currentMonth;

    this.usageAlertMessage = `Hai ${this.buildAvailabilityLabel(referenceMonth.remainingDays, referenceMonth.remainingHours)} ancora disponibili`;
    this.usageDateMessage = '';
    this.usageWarningMessage = '';

    if (!draftDate) {
      return;
    }

    const validation = validatePermesso104Usage(this.configSnapshot, this.usages, this.usageDraft, this.today);

    if (validation.isBeforeEffectiveStart) {
      this.usageDateMessage = `La data selezionata precede la decorrenza effettiva del ${this.formatDate(this.effectiveStartDate)}.`;
    }

    if (validation.exceedsMonthlyLimit) {
      this.usageWarningMessage = 'Stai superando il limite mensile';
    }
  }

  private buildAvailabilityLabel(days: number, hours: number): string {
    return this.isHourlyMode ? this.formatHourValue(hours) : this.formatDayValue(days);
  }

  private resetConfigForm(): void {
    this.configForm.reset(
      {
        dataAccettazione: null,
        dataInizioFruizione: null,
        protocollo: '',
        gradoParentela: '',
        modalitaFruizione: 'GIORNI',
        oreSettimanali: null,
        giorniLavorativiSettimanali: null
      },
      { emitEvent: false }
    );
    this.recalculate();
    this.refreshUsageMessages();
  }

  private applySavedConfig(config: Permesso104ConfigDto): void {
    this.configForm.patchValue(
      {
        dataAccettazione: this.parseApiDate(config.dataAccettazione),
        dataInizioFruizione: this.parseApiDate(config.dataInizioFruizione),
        protocollo: config.protocollo ?? '',
        gradoParentela: config.gradoParentela ?? '',
        modalitaFruizione: config.modalitaFruizione ?? 'GIORNI',
        oreSettimanali: this.normalizeNumber(config.oreSettimanali),
        giorniLavorativiSettimanali: this.normalizeNumber(config.giorniLavorativiSettimanali)
      },
      { emitEvent: false }
    );
    this.recalculate();
    this.refreshUsageMessages();
  }

  private toDto(userId: string): Permesso104ConfigDto {
    return {
      ...(this.savedConfig ?? {}),
      userId,
      dataAccettazione: this.configForm.controls.dataAccettazione.value ? toIsoDate(this.configForm.controls.dataAccettazione.value) : null,
      dataInizioFruizione: this.configForm.controls.dataInizioFruizione.value ? toIsoDate(this.configForm.controls.dataInizioFruizione.value) : null,
      protocollo: this.configForm.controls.protocollo.value.trim(),
      gradoParentela: this.configForm.controls.gradoParentela.value,
      modalitaFruizione: this.currentMode,
      oreSettimanali: this.normalizeNumber(this.configForm.controls.oreSettimanali.value),
      giorniLavorativiSettimanali: this.normalizeNumber(this.configForm.controls.giorniLavorativiSettimanali.value)
    };
  }

  private parseApiDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const parsed = parseISO(value);
    if (isValid(parsed)) {
      return parsed;
    }

    const fallback = new Date(value);
    return isValid(fallback) ? fallback : null;
  }

  private normalizeNumber(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : null;
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('it-IT', {
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(value) ? 0 : 1
    }).format(value);
  }
}
