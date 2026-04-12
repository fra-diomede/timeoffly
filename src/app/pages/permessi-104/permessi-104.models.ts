export type Permesso104Mode = 'GIORNI' | 'ORE';

export interface Permesso104Config {
  dataAccettazione: Date | null;
  dataInizioFruizione: Date | null;
  protocollo: string;
  gradoParentela: string;
  modalitaFruizione: Permesso104Mode;
  oreSettimanali: number | null;
  giorniLavorativiSettimanali: number | null;
}

export interface Permesso104ConfigDto {
  id?: number | null;
  userId: string;
  dataAccettazione: string | null;
  dataInizioFruizione: string | null;
  protocollo: string;
  gradoParentela: string;
  modalitaFruizione: Permesso104Mode;
  oreSettimanali: number | null;
  giorniLavorativiSettimanali: number | null;
}

export interface Permesso104Assistito {
  id: string;
  nome: string;
  gradoParentela: string;
}

export interface Permesso104Usage {
  id: string;
  data: Date;
  modalita: Permesso104Mode;
  ore: number | null;
}

export interface Permesso104UsageDraft {
  data: Date | null;
  modalita: Permesso104Mode;
  ore: number | null;
}

export interface Permesso104MonthAnalytics {
  active: boolean;
  entries: Permesso104Usage[];
  lostDays: number;
  lostHours: number;
  monthDate: Date;
  monthKey: string;
  monthLabel: string;
  remainingDays: number;
  remainingHours: number;
  totalDays: number;
  totalHours: number;
  usedDays: number;
  usedHours: number;
}

export interface Permessi104DashboardData {
  averageDailyHours: number;
  currentMonth: Permesso104MonthAnalytics;
  lostPreviousDays: number;
  lostPreviousHours: number;
  monthlyAnalytics: Permesso104MonthAnalytics[];
  monthlyHourAllowance: number;
}

export interface Permesso104UsageValidation {
  exceedsMonthlyLimit: boolean;
  isBeforeEffectiveStart: boolean;
  month: Permesso104MonthAnalytics;
  remainingAfterInsertionDays: number;
  remainingAfterInsertionHours: number;
}
