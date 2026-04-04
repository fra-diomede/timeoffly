import { CommonModule } from '@angular/common';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize, startWith } from 'rxjs';
import { BrandLockupComponent } from '../../components/brand-lockup/brand-lockup.component';
import { SKIP_GLOBAL_HTTP_ERROR_HANDLING } from '../../core/interceptors/error-handler.context';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RegisterRequest } from '../../models/auth.model';
import { REGISTER_WIZARD_STEPS, REGISTER_WORKING_DAYS_OPTIONS } from './register.wizard';
import {
  RegisterAllowanceComparisonItem,
  RegisterAllowanceSelectionSummary,
  RegisterContractCode,
  RegisterContractDefinition,
  RegisterSuggestionResult,
  RegisterWizardField,
  RegisterWizardStepDefinition,
  RegisterWorkingDaysOption
} from './register.models';
import { RegisterSuggestionsService } from './register.suggestions.service';

interface RegisterFormControls {
  nome: FormControl<string>;
  cognome: FormControl<string>;
  username: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  contractCode: FormControl<RegisterContractCode | ''>;
  customContractName: FormControl<string>;
  workingDaysPreset: FormControl<RegisterWorkingDaysOption | ''>;
  workingDaysCustom: FormControl<number | null>;
  giorniTotali: FormControl<number | null>;
  oreTotali: FormControl<number | null>;
}

type RegisterFormGroup = FormGroup<RegisterFormControls>;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    BrandLockupComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private readonly destroyRef = inject(DestroyRef);
  readonly contractSourceMicrocopy =
    "I valori suggeriti possono variare in base ad accordi aziendali o casi specifici.";

  readonly wizardSteps = REGISTER_WIZARD_STEPS;
  readonly workingDaysOptions = REGISTER_WORKING_DAYS_OPTIONS;
  readonly contractOptions: readonly RegisterContractDefinition[];

  readonly form: RegisterFormGroup = new FormGroup<RegisterFormControls>({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cognome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    contractCode: new FormControl<RegisterContractCode | ''>('', { nonNullable: true, validators: [Validators.required] }),
    customContractName: new FormControl('', { nonNullable: true }),
    workingDaysPreset: new FormControl<RegisterWorkingDaysOption | ''>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    workingDaysCustom: new FormControl<number | null>(null),
    giorniTotali: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    oreTotali: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] })
  });

  loading = false;
  currentStepIndex = 0;
  submitErrorMessage = '';
  suggestion: RegisterSuggestionResult | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly notifications: NotificationService,
    private readonly registerSuggestionsService: RegisterSuggestionsService,
    private readonly router: Router
  ) {
    this.contractOptions = this.registerSuggestionsService.getContracts();
    this.setupConditionalValidation();
    this.setupSuggestionSync();
  }

  get currentStep(): RegisterWizardStepDefinition {
    return this.wizardSteps[this.currentStepIndex]!;
  }

  get currentStepNumber(): number {
    return this.currentStepIndex + 1;
  }

  get totalSteps(): number {
    return this.wizardSteps.length;
  }

  get progressValue(): number {
    return Math.round((this.currentStepNumber / this.totalSteps) * 100);
  }

  get canGoBack(): boolean {
    return this.currentStepIndex > 0;
  }

  get isLastStep(): boolean {
    return this.currentStepIndex === this.totalSteps - 1;
  }

  get primaryActionLabel(): string {
    if (this.loading) {
      return 'Creazione profilo...';
    }

    return this.isLastStep ? 'Crea profilo' : 'Avanti';
  }

  get isCustomContractSelected(): boolean {
    return this.form.controls.contractCode.value === RegisterContractCode.Custom;
  }

  get isCustomWorkingDaysSelected(): boolean {
    return this.form.controls.workingDaysPreset.value === RegisterWorkingDaysOption.Custom;
  }

  get selectedContractDefinition(): RegisterContractDefinition | null {
    return this.registerSuggestionsService.getContractByCode(this.form.controls.contractCode.value);
  }

  get selectedContractLabel(): string {
    const selectedContract = this.selectedContractDefinition;
    if (!selectedContract) {
      return 'Da scegliere';
    }

    if (selectedContract.isCustom) {
      return this.normalizeString(this.form.controls.customContractName.value) ?? selectedContract.label;
    }

    return selectedContract.label;
  }

  get selectedContractDataStateLabel(): string {
    const selectedContract = this.selectedContractDefinition;
    return selectedContract ? this.registerSuggestionsService.getContractDataStateLabel(selectedContract) : 'Contratto';
  }

  get workingDaysSummary(): string {
    const workingDaysPerWeek = this.getWorkingDaysPerWeek();
    return workingDaysPerWeek === null ? 'Da definire' : `${workingDaysPerWeek} giorni a settimana`;
  }

  get configurationSummary(): string {
    const annualLeaveFinal = this.form.controls.giorniTotali.value;
    const annualPermitHoursFinal = this.form.controls.oreTotali.value;
    if (typeof annualLeaveFinal === 'number' && typeof annualPermitHoursFinal === 'number') {
      return `${annualLeaveFinal} gg ferie / ${annualPermitHoursFinal} h permessi`;
    }

    if (this.suggestion) {
      return `${this.suggestion.annualLeaveSuggested} gg ferie / ${this.suggestion.annualPermitHoursSuggested} h permessi`;
    }

    return 'Da definire';
  }

  get previewRows(): ReadonlyArray<{ label: string; value: string }> {
    return [
      { label: 'Profilo', value: this.getPreviewName() },
      { label: 'Accesso', value: this.getPreviewAccess() },
      { label: 'Contratto', value: this.selectedContractLabel },
      { label: 'Settimana', value: this.workingDaysSummary },
      { label: 'Configurazione iniziale', value: this.configurationSummary }
    ];
  }

  get allowanceSelectionSummary(): RegisterAllowanceSelectionSummary | null {
    return this.registerSuggestionsService.buildAllowanceSelectionSummary(
      this.suggestion,
      this.form.controls.giorniTotali.value,
      this.form.controls.oreTotali.value
    );
  }

  get isUsingSuggestedVacation(): boolean {
    return this.allowanceSelectionSummary?.annualLeave.isCustomized === false;
  }

  get isUsingSuggestedPermissions(): boolean {
    return this.allowanceSelectionSummary?.annualPermitHours.isCustomized === false;
  }

  get hasCustomizedAllowances(): boolean {
    return this.allowanceSelectionSummary?.isAlignedWithSuggestion === false;
  }

  get selectedContractSourceUrl(): string | null {
    return this.selectedContractDefinition?.sourceUrl ?? null;
  }

  get hasSelectedContractSource(): boolean {
    return !!this.selectedContractSourceUrl;
  }

  get selectedContractNotes(): string | null {
    return this.selectedContractDefinition?.notes ?? null;
  }

  onPrimaryAction(): void {
    if (this.loading) {
      return;
    }

    this.submitErrorMessage = '';
    if (this.isLastStep) {
      this.submit();
      return;
    }

    this.goToNextStep();
  }

  goToNextStep(): void {
    if (!this.validateStep(this.currentStepIndex)) {
      return;
    }

    this.currentStepIndex = Math.min(this.currentStepIndex + 1, this.totalSteps - 1);
  }

  goToPreviousStep(): void {
    this.submitErrorMessage = '';
    this.currentStepIndex = Math.max(this.currentStepIndex - 1, 0);
  }

  goToStep(stepIndex: number): void {
    if (stepIndex < 0 || stepIndex > this.currentStepIndex || stepIndex >= this.totalSteps) {
      return;
    }

    this.submitErrorMessage = '';
    this.currentStepIndex = stepIndex;
  }

  selectContract(contractCode: RegisterContractCode): void {
    this.form.controls.contractCode.setValue(contractCode);
    this.form.controls.contractCode.markAsTouched();
    this.submitErrorMessage = '';
  }

  selectWorkingDays(option: RegisterWorkingDaysOption): void {
    this.form.controls.workingDaysPreset.setValue(option);
    this.form.controls.workingDaysPreset.markAsTouched();
    this.submitErrorMessage = '';
  }

  applySuggestedValues(): void {
    if (!this.suggestion) {
      return;
    }

    this.setAllowanceControls(this.suggestion.annualLeaveSuggested, this.suggestion.annualPermitHoursSuggested);
  }

  shouldShowError(controlName: RegisterWizardField): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: RegisterWizardField): string {
    const control = this.form.controls[controlName];
    if (!control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      switch (controlName) {
        case 'contractCode':
          return 'Seleziona un contratto per continuare';
        case 'customContractName':
          return 'Inserisci il nome del contratto personalizzato';
        case 'workingDaysPreset':
          return 'Seleziona i giorni lavorativi settimanali';
        case 'workingDaysCustom':
          return 'Inserisci i giorni lavorativi settimanali';
        case 'giorniTotali':
          return 'Inserisci il totale ferie annuo';
        case 'oreTotali':
          return 'Inserisci il totale ore permessi annuo';
        default:
          return 'Campo obbligatorio';
      }
    }

    if (control.hasError('email')) {
      return 'Inserisci un indirizzo email valido';
    }

    if (control.hasError('min')) {
      return controlName === 'workingDaysCustom'
        ? 'Inserisci un valore compreso tra 1 e 7'
        : 'Inserisci un valore uguale o superiore a 0';
    }

    if (control.hasError('max')) {
      return 'Inserisci un valore compreso tra 1 e 7';
    }

    return 'Controlla i dati inseriti';
  }

  getStepStateLabel(stepIndex: number): string {
    if (stepIndex < this.currentStepIndex) {
      return 'Completato';
    }

    if (stepIndex === this.currentStepIndex) {
      return 'In corso';
    }

    return 'In attesa';
  }

  getContractWorkingPattern(contract: RegisterContractDefinition): string {
    return `${contract.defaultWorkingDaysPerWeek} giorni standard`;
  }

  getContractAllowancePreview(contract: RegisterContractDefinition): string {
    return `${contract.annualLeaveSuggestion} gg ferie / ${contract.annualPermitHoursSuggestion} h permessi`;
  }

  getContractCardLabel(contract: RegisterContractDefinition): string {
    return this.registerSuggestionsService.getContractDataStateLabel(contract);
  }

  getContractCardNote(contract: RegisterContractDefinition): string {
    return contract.notes ?? 'Configurazione iniziale disponibile in TimeOffly.';
  }

  getAllowanceDifferenceLabel(item: RegisterAllowanceComparisonItem): string {
    if (item.delta === 0) {
      return 'Nessuna differenza';
    }

    const sign = item.delta > 0 ? '+' : '';
    return `${sign}${item.delta} ${item.shortUnitLabel}`;
  }

  getSelectedContractInfoLabel(): string {
    return this.hasSelectedContractSource ? 'Vedi fonte contratto' : 'Fonte non ancora disponibile';
  }

  private setupConditionalValidation(): void {
    this.form.controls.contractCode.valueChanges
      .pipe(startWith(this.form.controls.contractCode.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(contractCode => {
        const customContractNameControl = this.form.controls.customContractName;
        if (contractCode === RegisterContractCode.Custom) {
          customContractNameControl.setValidators([Validators.required]);
        } else {
          customContractNameControl.clearValidators();
          customContractNameControl.setValue('', { emitEvent: false });
        }

        customContractNameControl.updateValueAndValidity({ emitEvent: false });
      });

    this.form.controls.workingDaysPreset.valueChanges
      .pipe(startWith(this.form.controls.workingDaysPreset.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(preset => {
        const workingDaysCustomControl = this.form.controls.workingDaysCustom;
        if (preset === RegisterWorkingDaysOption.Custom) {
          workingDaysCustomControl.setValidators([Validators.required, Validators.min(1), Validators.max(7)]);
        } else {
          workingDaysCustomControl.clearValidators();
          workingDaysCustomControl.setValue(null, { emitEvent: false });
        }

        workingDaysCustomControl.updateValueAndValidity({ emitEvent: false });
      });
  }

  private setupSuggestionSync(): void {
    this.form.controls.contractCode.valueChanges
      .pipe(startWith(this.form.controls.contractCode.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshSuggestion();
      });

    this.form.controls.workingDaysPreset.valueChanges
      .pipe(startWith(this.form.controls.workingDaysPreset.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshSuggestion();
      });

    this.form.controls.workingDaysCustom.valueChanges
      .pipe(startWith(this.form.controls.workingDaysCustom.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshSuggestion();
      });
  }

  private refreshSuggestion(): void {
    const nextSuggestion = this.registerSuggestionsService.buildSuggestion(
      this.form.controls.contractCode.value,
      this.getWorkingDaysPerWeek()
    );
    this.suggestion = nextSuggestion;

    if (!nextSuggestion) {
      return;
    }

    this.setAllowanceControls(nextSuggestion.annualLeaveSuggested, nextSuggestion.annualPermitHoursSuggested);
  }

  private setAllowanceControls(vacationDays: number, permissionHours: number): void {
    this.form.controls.giorniTotali.setValue(vacationDays, { emitEvent: false });
    this.form.controls.giorniTotali.markAsPristine();

    this.form.controls.oreTotali.setValue(permissionHours, { emitEvent: false });
    this.form.controls.oreTotali.markAsPristine();
  }

  private getWorkingDaysPerWeek(): number | null {
    switch (this.form.controls.workingDaysPreset.value) {
      case RegisterWorkingDaysOption.FiveDays:
        return 5;
      case RegisterWorkingDaysOption.SixDays:
        return 6;
      case RegisterWorkingDaysOption.Custom:
        return this.form.controls.workingDaysCustom.value;
      default:
        return null;
    }
  }

  private validateStep(stepIndex: number): boolean {
    const step = this.wizardSteps[stepIndex];
    if (!step) {
      return false;
    }

    let isValid = true;

    for (const fieldName of step.fields) {
      if (!this.isRelevantField(fieldName)) {
        continue;
      }

      const control = this.form.controls[fieldName];
      if (control.invalid) {
        control.markAsTouched();
        control.markAsDirty();
        isValid = false;
      }
    }

    return isValid;
  }

  private ensureAllStepsValid(): boolean {
    for (let stepIndex = 0; stepIndex < this.totalSteps - 1; stepIndex += 1) {
      if (!this.validateStep(stepIndex)) {
        this.currentStepIndex = stepIndex;
        return false;
      }
    }

    return true;
  }

  private isRelevantField(fieldName: RegisterWizardField): boolean {
    if (fieldName === 'customContractName') {
      return this.isCustomContractSelected;
    }

    if (fieldName === 'workingDaysCustom') {
      return this.isCustomWorkingDaysSelected;
    }

    return true;
  }

  private submit(): void {
    if (!this.ensureAllStepsValid()) {
      return;
    }

    this.loading = true;
    this.submitErrorMessage = '';

    const context = new HttpContext().set(SKIP_GLOBAL_HTTP_ERROR_HANDLING, true);

    this.authService
      .register(this.buildRegisterPayload(), { context })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: () => {
          this.notifications.success('Registrazione completata. Ora puoi accedere.');
          void this.router.navigate(['/auth/login'], {
            replaceUrl: true,
            queryParamsHandling: 'preserve'
          });
        },
        error: (error: unknown) => {
          this.submitErrorMessage = this.resolveRegisterErrorMessage(error);
          this.notifications.error(this.submitErrorMessage, {
            dedupeKey: `register-submit:${this.submitErrorMessage}`
          });
        }
      });
  }

  private buildRegisterPayload(): RegisterRequest {
    // TODO(register-backend): inviare anche contractCode, sourceUrl e workingDaysPerWeek
    // quando l'API supportera' metadati piu' strutturati per il wizard.
    return {
      nome: this.normalizeString(this.form.controls.nome.value) ?? '',
      cognome: this.normalizeString(this.form.controls.cognome.value) ?? '',
      username: this.normalizeString(this.form.controls.username.value) ?? '',
      email: this.normalizeString(this.form.controls.email.value) ?? '',
      password: this.form.controls.password.value,
      contratto: this.selectedContractLabel,
      giorniTotali: this.form.controls.giorniTotali.value ?? 0,
      oreTotali: this.form.controls.oreTotali.value ?? 0
    };
  }

  private resolveRegisterErrorMessage(error: unknown): string {
    const httpError = error instanceof HttpErrorResponse ? error : null;
    const backendMessage = this.extractPayloadMessage(httpError?.error) ?? this.normalizeMessage(httpError?.message);
    if (backendMessage) {
      return backendMessage;
    }

    switch (httpError?.status) {
      case 0:
        return 'Non riusciamo a contattare il server in questo momento. Controlla la connessione e riprova.';
      case 400:
        return 'Controlla i dati inseriti e riprova: alcuni campi potrebbero non essere stati accettati.';
      case 409:
        return "Username o email risultano gia' in uso. Prova con credenziali diverse.";
      default:
        return 'Non siamo riusciti a creare il profilo. Riprova tra qualche istante.';
    }
  }

  private extractPayloadMessage(payload: unknown, depth = 0): string | null {
    if (payload == null || depth > 4) {
      return null;
    }

    if (typeof payload === 'string') {
      return this.normalizeMessage(payload);
    }

    if (Array.isArray(payload)) {
      for (const item of payload) {
        const message = this.extractPayloadMessage(item, depth + 1);
        if (message) {
          return message;
        }
      }

      return null;
    }

    if (typeof payload !== 'object') {
      return null;
    }

    const record = payload as Record<string, unknown>;
    for (const key of ['message', 'detail', 'error_description', 'description', 'title', 'error'] as const) {
      const message = this.extractPayloadMessage(record[key], depth + 1);
      if (message) {
        return message;
      }
    }

    return null;
  }

  private getPreviewName(): string {
    const nome = this.normalizeString(this.form.controls.nome.value);
    const cognome = this.normalizeString(this.form.controls.cognome.value);
    const fullName = [nome, cognome].filter((value): value is string => !!value).join(' ');
    return fullName || 'Da completare';
  }

  private getPreviewAccess(): string {
    const username = this.normalizeString(this.form.controls.username.value);
    const email = this.normalizeString(this.form.controls.email.value);
    if (username && email) {
      return `${username} / ${email}`;
    }

    return username ?? email ?? 'Da completare';
  }

  private normalizeString(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalizedValue = value.trim();
    return normalizedValue ? normalizedValue : null;
  }

  private normalizeMessage(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalizedValue = value.trim();
    if (!normalizedValue) {
      return null;
    }

    const loweredValue = normalizedValue.toLowerCase();
    if (loweredValue.startsWith('http failure response for') || loweredValue === 'bad request') {
      return null;
    }

    return normalizedValue;
  }
}
