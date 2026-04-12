import {
  buildPermessi104DashboardData,
  getAverageDailyHours,
  getMonthlyHourAllowance,
  validatePermesso104Usage
} from './permessi-104.logic';
import { Permesso104Config, Permesso104Usage } from './permessi-104.models';

describe('permessi-104 logic', () => {
  const config: Permesso104Config = {
    dataAccettazione: new Date(2026, 0, 3),
    dataInizioFruizione: new Date(2026, 0, 1),
    protocollo: '104-2026-001',
    gradoParentela: 'Genitore',
    modalitaFruizione: 'ORE',
    oreSettimanali: 40,
    giorniLavorativiSettimanali: 5
  };
  const referenceDate = new Date(2026, 3, 12);

  it('should calculate daily and monthly hourly allowance', () => {
    expect(getAverageDailyHours(config)).toBe(8);
    expect(getMonthlyHourAllowance(config)).toBe(24);
  });

  it('should accumulate lost quota from previous months', () => {
    const usages: Permesso104Usage[] = [
      { id: 'usage-1', data: new Date(2026, 0, 10), modalita: 'ORE', ore: 8 },
      { id: 'usage-2', data: new Date(2026, 1, 11), modalita: 'GIORNI', ore: null },
      { id: 'usage-3', data: new Date(2026, 3, 1), modalita: 'ORE', ore: 4 }
    ];

    const dashboard = buildPermessi104DashboardData(config, usages, referenceDate);

    expect(dashboard.currentMonth.usedHours).toBe(4);
    expect(dashboard.currentMonth.remainingHours).toBe(20);
    expect(dashboard.lostPreviousHours).toBe(56);
    expect(dashboard.lostPreviousDays).toBe(7);
  });

  it('should block usage beyond the monthly limit', () => {
    const usages: Permesso104Usage[] = [
      { id: 'usage-1', data: new Date(2026, 3, 2), modalita: 'ORE', ore: 20 }
    ];

    const validation = validatePermesso104Usage(
      config,
      usages,
      { data: new Date(2026, 3, 8), modalita: 'ORE', ore: 6 },
      referenceDate
    );

    expect(validation.exceedsMonthlyLimit).toBeTrue();
    expect(validation.remainingAfterInsertionHours).toBe(0);
  });

  it('should reject usage dates before the effective start', () => {
    const validation = validatePermesso104Usage(
      config,
      [],
      { data: new Date(2026, 0, 1), modalita: 'GIORNI', ore: null },
      referenceDate
    );

    expect(validation.isBeforeEffectiveStart).toBeTrue();
  });
});
