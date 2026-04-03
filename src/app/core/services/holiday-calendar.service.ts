import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { AvailableCountry, CountryOption, PublicHoliday } from '../../models/holiday-calendar.model';
import { toIsoDate } from '../utils/date.util';

@Injectable({ providedIn: 'root' })
export class HolidayCalendarService {
  private readonly baseUrl = 'https://date.nager.at/api/v3';
  private availableCountriesRequest$?: Observable<AvailableCountry[]>;
  private readonly publicHolidayRequests = new Map<string, Observable<PublicHoliday[]>>();

  constructor(private http: HttpClient) {}

  getAvailableCountries(): Observable<AvailableCountry[]> {
    if (!this.availableCountriesRequest$) {
      this.availableCountriesRequest$ = this.http.get<AvailableCountry[]>(`${this.baseUrl}/AvailableCountries`).pipe(
        map(response => this.normalizeCountries(response)),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(() => {
          this.availableCountriesRequest$ = undefined;
          return of([]);
        })
      );
    }

    return this.availableCountriesRequest$;
  }

  getCountryOptions(): Observable<CountryOption[]> {
    return this.getAvailableCountries().pipe(
      map(countries =>
        countries.map(country => ({
          label: country.name,
          value: country.countryCode
        }))
      )
    );
  }

  getPublicHolidays(year: number, countryCode: string): Observable<PublicHoliday[]> {
    const normalizedYear = this.normalizeYear(year);
    const normalizedCountryCode = this.normalizeCountryCode(countryCode);
    if (!normalizedCountryCode) {
      return of([]);
    }

    const cacheKey = `${normalizedYear}-${normalizedCountryCode}`;
    const cachedRequest = this.publicHolidayRequests.get(cacheKey);
    if (cachedRequest) {
      return cachedRequest;
    }

    const request$ = this.http
      .get<PublicHoliday[]>(`${this.baseUrl}/PublicHolidays/${normalizedYear}/${normalizedCountryCode}`)
      .pipe(
        map(response => this.normalizeHolidays(response, normalizedCountryCode)),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(() => {
          this.publicHolidayRequests.delete(cacheKey);
          return of([]);
        })
      );

    this.publicHolidayRequests.set(cacheKey, request$);
    return request$;
  }

  private normalizeCountries(response: unknown): AvailableCountry[] {
    if (!Array.isArray(response)) {
      return [];
    }

    return response
      .map(country => this.normalizeCountry(country))
      .filter((country): country is AvailableCountry => !!country)
      .sort((left, right) => left.name.localeCompare(right.name, 'it', { sensitivity: 'base' }));
  }

  private normalizeCountry(value: unknown): AvailableCountry | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as Record<string, unknown>;
    const countryCode = this.normalizeCountryCode(record['countryCode']);
    const name = this.normalizeText(record['name']);

    if (!countryCode || !name) {
      return null;
    }

    return { countryCode, name };
  }

  private normalizeHolidays(response: unknown, fallbackCountryCode: string): PublicHoliday[] {
    if (!Array.isArray(response)) {
      return [];
    }

    return response
      .map(holiday => this.normalizeHoliday(holiday, fallbackCountryCode))
      .filter((holiday): holiday is PublicHoliday => !!holiday)
      .sort((left, right) => left.date.localeCompare(right.date));
  }

  private normalizeHoliday(value: unknown, fallbackCountryCode: string): PublicHoliday | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as Record<string, unknown>;
    const date = this.normalizeIsoDate(record['date']);
    const name = this.normalizeText(record['name']);
    const localName = this.normalizeText(record['localName']) ?? name;
    const countryCode = this.normalizeCountryCode(record['countryCode']) ?? fallbackCountryCode;

    if (!date || !name || !localName) {
      return null;
    }

    return {
      date,
      localName,
      name,
      countryCode,
      global: typeof record['global'] === 'boolean' ? record['global'] : false,
      counties: this.normalizeStringArray(record['counties']),
      launchYear: this.normalizeNullableYear(record['launchYear']),
      types: this.normalizeStringArray(record['types'])
    };
  }

  private normalizeCountryCode(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim().toUpperCase();
    return normalized ? normalized : null;
  }

  private normalizeText(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized ? normalized : null;
  }

  private normalizeStringArray(value: unknown): string[] | null {
    if (!Array.isArray(value)) {
      return null;
    }

    const normalized = value
      .filter((entry): entry is string => typeof entry === 'string')
      .map(entry => entry.trim())
      .filter(Boolean);

    return normalized.length ? normalized : null;
  }

  private normalizeIsoDate(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = toIsoDate(value);
    return normalized || null;
  }

  private normalizeNullableYear(value: unknown): number | null {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return null;
    }

    return Math.trunc(value);
  }

  private normalizeYear(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return new Date().getFullYear();
    }

    return Math.max(1970, Math.trunc(value));
  }
}
