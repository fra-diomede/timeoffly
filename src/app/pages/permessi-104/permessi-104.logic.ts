import { endOfYear, format, isBefore, isSameMonth, startOfDay, startOfMonth, startOfYear } from 'date-fns';
import {
  Permesso104Config,
  Permessi104DashboardData,
  Permesso104MonthAnalytics,
  Permesso104Usage,
  Permesso104UsageDraft,
  Permesso104UsageValidation
} from './permessi-104.models';

const MONTHLY_DAY_ALLOWANCE = 3;
const EPSILON = 0.0001;
const monthFormatter = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });

function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}

function capitalize(label: string): string {
  return label ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : label;
}

function isValidDate(value: Date | null | undefined): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function formatMonthLabel(monthDate: Date): string {
  return capitalize(monthFormatter.format(monthDate));
}

function createMonthKey(monthDate: Date): string {
  return format(monthDate, 'yyyy-MM');
}

function getMonthRange(config: Permesso104Config, referenceDate: Date): Date[] {
  const effectiveStart = getEffectiveStartDate(config);
  const rangeStart = effectiveStart ? startOfMonth(effectiveStart) : startOfYear(referenceDate);
  const endYear = Math.max(rangeStart.getFullYear(), referenceDate.getFullYear());
  const rangeEnd = endOfYear(new Date(endYear, 0, 1));
  const months: Date[] = [];
  let cursor = startOfMonth(rangeStart);

  while (cursor <= rangeEnd) {
    months.push(cursor);
    cursor = startOfMonth(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  }

  return months;
}

function getUsageEquivalent(entry: Pick<Permesso104Usage, 'modalita' | 'ore'>, dailyHours: number) {
  if (entry.modalita === 'GIORNI') {
    return {
      days: 1,
      hours: roundMetric(dailyHours)
    };
  }

  const hours = roundMetric(Math.max(0, entry.ore ?? 0));
  const days = dailyHours > 0 ? roundMetric(hours / dailyHours) : 0;

  return { days, hours };
}

function createMonthAnalytics(
  monthDate: Date,
  active: boolean,
  config: Permesso104Config,
  usages: Permesso104Usage[],
  referenceDate: Date
): Permesso104MonthAnalytics {
  const dailyHours = getAverageDailyHours(config);
  const totalDays = active ? MONTHLY_DAY_ALLOWANCE : 0;
  const totalHours = active ? getMonthlyHourAllowance(config) : 0;
  const sortedEntries = [...usages].sort((left, right) => left.data.getTime() - right.data.getTime());
  const used = sortedEntries.reduce(
    (accumulator, entry) => {
      const equivalent = getUsageEquivalent(entry, dailyHours);

      return {
        days: roundMetric(accumulator.days + equivalent.days),
        hours: roundMetric(accumulator.hours + equivalent.hours)
      };
    },
    { days: 0, hours: 0 }
  );
  const remainingDays = active ? roundMetric(Math.max(0, totalDays - used.days)) : 0;
  const remainingHours = active ? roundMetric(Math.max(0, totalHours - used.hours)) : 0;
  const lostApplies = active && isBefore(monthDate, startOfMonth(referenceDate));

  return {
    active,
    entries: sortedEntries,
    lostDays: lostApplies ? remainingDays : 0,
    lostHours: lostApplies ? remainingHours : 0,
    monthDate,
    monthKey: createMonthKey(monthDate),
    monthLabel: formatMonthLabel(monthDate),
    remainingDays,
    remainingHours,
    totalDays,
    totalHours,
    usedDays: roundMetric(used.days),
    usedHours: roundMetric(used.hours)
  };
}

function createInactiveCurrentMonth(referenceDate: Date): Permesso104MonthAnalytics {
  const monthDate = startOfMonth(referenceDate);

  return {
    active: false,
    entries: [],
    lostDays: 0,
    lostHours: 0,
    monthDate,
    monthKey: createMonthKey(monthDate),
    monthLabel: formatMonthLabel(monthDate),
    remainingDays: 0,
    remainingHours: 0,
    totalDays: 0,
    totalHours: 0,
    usedDays: 0,
    usedHours: 0
  };
}

export function getEffectiveStartDate(config: Permesso104Config): Date | null {
  const validDates = [config.dataAccettazione, config.dataInizioFruizione].filter(isValidDate);
  if (validDates.length === 0) {
    return null;
  }

  return validDates.reduce((latest, candidate) => (candidate > latest ? candidate : latest));
}

export function getAverageDailyHours(config: Permesso104Config): number {
  const weeklyHours = config.oreSettimanali ?? 0;
  const weeklyDays = config.giorniLavorativiSettimanali ?? 0;

  if (weeklyHours <= 0 || weeklyDays <= 0) {
    return 0;
  }

  return roundMetric(weeklyHours / weeklyDays);
}

export function getMonthlyHourAllowance(config: Permesso104Config): number {
  return roundMetric(getAverageDailyHours(config) * MONTHLY_DAY_ALLOWANCE);
}

export function buildPermessi104DashboardData(
  config: Permesso104Config,
  usages: Permesso104Usage[],
  referenceDate: Date = new Date()
): Permessi104DashboardData {
  const effectiveStart = getEffectiveStartDate(config);
  const startMonth = effectiveStart ? startOfMonth(effectiveStart) : null;
  const months = getMonthRange(config, referenceDate).map(monthDate => {
    const active = !startMonth || monthDate >= startMonth;
    const monthEntries = usages.filter(entry => isSameMonth(entry.data, monthDate));
    return createMonthAnalytics(monthDate, active, config, monthEntries, referenceDate);
  });
  const currentMonth = months.find(month => isSameMonth(month.monthDate, referenceDate)) ?? createInactiveCurrentMonth(referenceDate);
  const lostPreviousDays = roundMetric(
    months
      .filter(month => isBefore(month.monthDate, startOfMonth(referenceDate)))
      .reduce((total, month) => total + month.lostDays, 0)
  );
  const lostPreviousHours = roundMetric(
    months
      .filter(month => isBefore(month.monthDate, startOfMonth(referenceDate)))
      .reduce((total, month) => total + month.lostHours, 0)
  );

  return {
    averageDailyHours: getAverageDailyHours(config),
    currentMonth,
    lostPreviousDays,
    lostPreviousHours,
    monthlyAnalytics: months,
    monthlyHourAllowance: getMonthlyHourAllowance(config)
  };
}

export function validatePermesso104Usage(
  config: Permesso104Config,
  usages: Permesso104Usage[],
  draft: Permesso104UsageDraft,
  referenceDate: Date = new Date()
): Permesso104UsageValidation {
  const effectiveStart = getEffectiveStartDate(config);
  const dashboard = buildPermessi104DashboardData(config, usages, referenceDate);
  const draftDate = draft.data ? startOfDay(draft.data) : startOfDay(referenceDate);
  const month = dashboard.monthlyAnalytics.find(item => isSameMonth(item.monthDate, draftDate)) ??
    createMonthAnalytics(startOfMonth(draftDate), false, config, [], referenceDate);
  const dailyHours = dashboard.averageDailyHours;
  const equivalent = getUsageEquivalent(draft, dailyHours);
  const projectedUsedDays = roundMetric(month.usedDays + equivalent.days);
  const projectedUsedHours = roundMetric(month.usedHours + equivalent.hours);
  const isBeforeEffectiveStart = !!effectiveStart && isBefore(draftDate, startOfDay(effectiveStart));
  const exceedsMonthlyLimit =
    projectedUsedDays > month.totalDays + EPSILON || projectedUsedHours > month.totalHours + EPSILON;

  return {
    exceedsMonthlyLimit,
    isBeforeEffectiveStart,
    month,
    remainingAfterInsertionDays: roundMetric(Math.max(0, month.totalDays - projectedUsedDays)),
    remainingAfterInsertionHours: roundMetric(Math.max(0, month.totalHours - projectedUsedHours))
  };
}
