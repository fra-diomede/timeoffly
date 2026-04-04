export enum RegisterContractCode {
  MetalmeccanicoIndustria = 'METALMECCANICO_INDUSTRIA',
  CommercioTerziario = 'COMMERCIO_TERZIARIO',
  Telecomunicazioni = 'TELECOMUNICAZIONI',
  StudiProfessionali = 'STUDI_PROFESSIONALI',
  Custom = 'CUSTOM'
}

export enum RegisterWorkingDaysOption {
  FiveDays = 'FIVE_DAYS',
  SixDays = 'SIX_DAYS',
  Custom = 'CUSTOM'
}

export type RegisterContractDataState = 'verified' | 'placeholder' | 'custom';
export type RegisterAllowanceSelectionState = 'aligned' | 'personalized';

export type RegisterWizardField =
  | 'nome'
  | 'cognome'
  | 'username'
  | 'email'
  | 'password'
  | 'contractCode'
  | 'customContractName'
  | 'workingDaysPreset'
  | 'workingDaysCustom'
  | 'giorniTotali'
  | 'oreTotali';

export type RegisterWizardStepId = 'account' | 'contract' | 'allowances' | 'summary';

export interface RegisterContractDefinition {
  code: RegisterContractCode;
  label: string;
  annualLeaveSuggestion: number;
  annualPermitHoursSuggestion: number;
  defaultWorkingDaysPerWeek: number;
  dataState: RegisterContractDataState;
  sourceLabel?: string;
  sourceUrl?: string;
  notes?: string;
  isCustom?: boolean;
}

export interface RegisterSuggestionResult {
  contract: RegisterContractDefinition;
  workingDaysPerWeek: number;
  annualLeaveSuggested: number;
  annualPermitHoursSuggested: number;
  explanation: string;
  disclaimer: string;
}

export interface RegisterAllowanceComparisonItem {
  label: string;
  shortUnitLabel: string;
  longUnitLabel: string;
  suggestedValue: number;
  finalValue: number;
  delta: number;
  isCustomized: boolean;
  stateLabel: string;
}

export interface RegisterAllowanceSelectionSummary {
  annualLeave: RegisterAllowanceComparisonItem;
  annualPermitHours: RegisterAllowanceComparisonItem;
  isAlignedWithSuggestion: boolean;
  state: RegisterAllowanceSelectionState;
  stateLabel: string;
  stateDescription: string;
}

export interface RegisterPanelMetric {
  value: string;
  label: string;
}

export interface RegisterWizardStepDefinition {
  id: RegisterWizardStepId;
  label: string;
  title: string;
  subtitle: string;
  fields: readonly RegisterWizardField[];
  panelBadge: string;
  panelTitle: string;
  panelDescription: string;
  panelMetrics: readonly RegisterPanelMetric[];
  panelBullets: readonly string[];
}

export interface RegisterWorkingDaysOptionDefinition {
  code: RegisterWorkingDaysOption;
  label: string;
  description: string;
  value?: number;
}
