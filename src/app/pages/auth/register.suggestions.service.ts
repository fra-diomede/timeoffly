import { Injectable } from '@angular/core';
import { REGISTER_CONTRACTS } from './register.contracts';
import {
  RegisterAllowanceComparisonItem,
  RegisterAllowanceSelectionSummary,
  RegisterContractCode,
  RegisterContractDefinition,
  RegisterSuggestionResult
} from './register.models';

const DEFAULT_CONTRACT_DISCLAIMER =
  "I valori suggeriti possono variare in base ad accordi aziendali, inquadramento specifico o policy interne.";

@Injectable({ providedIn: 'root' })
export class RegisterSuggestionsService {
  getContracts(): readonly RegisterContractDefinition[] {
    return REGISTER_CONTRACTS;
  }

  getContractByCode(code: RegisterContractCode | '' | null | undefined): RegisterContractDefinition | null {
    if (!code) {
      return null;
    }

    return REGISTER_CONTRACTS.find(contract => contract.code === code) ?? null;
  }

  buildSuggestion(
    contractCode: RegisterContractCode | '' | null | undefined,
    workingDaysPerWeek: number | null
  ): RegisterSuggestionResult | null {
    const contract = this.getContractByCode(contractCode);
    const normalizedWorkingDays = this.normalizeWorkingDays(workingDaysPerWeek);
    if (!contract || normalizedWorkingDays === null) {
      return null;
    }

    return {
      contract,
      workingDaysPerWeek: normalizedWorkingDays,
      annualLeaveSuggested: contract.annualLeaveSuggestion,
      annualPermitHoursSuggested: contract.annualPermitHoursSuggestion,
      explanation: this.buildExplanation(contract),
      disclaimer:
        normalizedWorkingDays === contract.defaultWorkingDaysPerWeek
          ? DEFAULT_CONTRACT_DISCLAIMER
          : `Hai selezionato ${normalizedWorkingDays} giorni lavorativi a settimana. Per ora TimeOffly non applica variazioni automatiche verificate su questa variabile.`
    };
  }

  buildAllowanceSelectionSummary(
    suggestion: RegisterSuggestionResult | null,
    annualLeaveFinal: number | null,
    annualPermitHoursFinal: number | null
  ): RegisterAllowanceSelectionSummary | null {
    if (!suggestion) {
      return null;
    }

    const annualLeave = this.createComparisonItem(
      'Ferie annue',
      'gg',
      'giorni',
      suggestion.annualLeaveSuggested,
      annualLeaveFinal ?? suggestion.annualLeaveSuggested
    );
    const annualPermitHours = this.createComparisonItem(
      'Ore permessi annue',
      'h',
      'ore',
      suggestion.annualPermitHoursSuggested,
      annualPermitHoursFinal ?? suggestion.annualPermitHoursSuggested
    );
    const isAlignedWithSuggestion = !annualLeave.isCustomized && !annualPermitHours.isCustomized;

    return {
      annualLeave,
      annualPermitHours,
      isAlignedWithSuggestion,
      state: isAlignedWithSuggestion ? 'aligned' : 'personalized',
      stateLabel: isAlignedWithSuggestion ? 'Allineato al contratto' : 'Personalizzato rispetto alla proposta',
      stateDescription: isAlignedWithSuggestion
        ? 'Confermerai esattamente la configurazione iniziale suggerita dal sistema.'
        : 'Salveremo i valori finali personalizzati che hai impostato nel wizard.'
    };
  }

  getContractDataStateLabel(contract: RegisterContractDefinition): string {
    switch (contract.dataState) {
      case 'verified':
        return 'Riferimento contrattuale';
      case 'placeholder':
        return 'Riferimento da verificare';
      case 'custom':
        return 'Configurazione libera';
      default:
        return 'Contratto';
    }
  }

  private createComparisonItem(
    label: string,
    shortUnitLabel: string,
    longUnitLabel: string,
    suggestedValue: number,
    finalValue: number
  ): RegisterAllowanceComparisonItem {
    const delta = finalValue - suggestedValue;
    const isCustomized = delta !== 0;

    return {
      label,
      shortUnitLabel,
      longUnitLabel,
      suggestedValue,
      finalValue,
      delta,
      isCustomized,
      stateLabel: isCustomized ? 'Modificato da te' : 'Suggerito da contratto'
    };
  }

  private buildExplanation(contract: RegisterContractDefinition): string {
    switch (contract.dataState) {
      case 'verified':
        return `Questa proposta parte dal riferimento contrattuale configurato per ${contract.label}.`;
      case 'placeholder':
        return `Questa proposta usa una base iniziale prudente per ${contract.label}, utile per iniziare ma da confermare.`;
      case 'custom':
        return 'Per il contratto personalizzato partiamo da una base modificabile, cosi puoi rifinire subito i valori.';
      default:
        return `Questa proposta iniziale e' basata sul contratto ${contract.label}.`;
    }
  }

  private normalizeWorkingDays(value: number | null): number | null {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return null;
    }

    const roundedValue = Math.round(value);
    if (roundedValue < 1 || roundedValue > 7) {
      return null;
    }

    return roundedValue;
  }
}
