import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HolidayCalendarService } from '../../core/services/holiday-calendar.service';
import { CountryOption, PublicHoliday } from '../../models/holiday-calendar.model';
import { toIsoDate, toItalianDate } from '../../core/utils/date.util';

interface DayCell {
  day: number;
  date: Date;
  dateLabel: string;
  isWeekend: boolean;
  isHoliday: boolean;
  isOfficial: boolean;
  label: string;
}

interface MonthCard {
  monthName: string;
  year: number;
  weeks: (DayCell | null)[][];
  holidays: DayCell[];
  holidayCount: number;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})
export class CalendarioComponent implements OnInit {
  year = new Date().getFullYear();
  country = 'IT';
  holidays: PublicHoliday[] = [];
  months: MonthCard[] = [];
  countryOptions: CountryOption[] = [];
  countryLabelMap: Record<string, string> = {};
  countriesLoading = false;
  calendarLoading = false;

  private readonly monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  constructor(private holidayCalendarService: HolidayCalendarService) {}

  get selectedCountryLabel(): string {
    return this.countryLabelMap[this.country] ?? this.country;
  }

  get totalHolidays(): number {
    return this.months.reduce((total, month) => total + month.holidayCount, 0);
  }

  ngOnInit() {
    this.loadCountries();
    this.load();
  }

  load() {
    this.year = this.normalizeYear(this.year);
    this.country = this.normalizeCountryCode(this.country) ?? 'IT';
    this.calendarLoading = true;

    this.holidayCalendarService
      .getPublicHolidays(this.year, this.country)
      .pipe(
        finalize(() => {
          this.calendarLoading = false;
        })
      )
      .subscribe(holidays => {
        this.holidays = holidays ?? [];
        this.months = this.buildMonths(this.holidays, this.year);
      });
  }

  onCountryChange(countryCode: string) {
    this.country = this.normalizeCountryCode(countryCode) ?? this.country;
    this.load();
  }

  private loadCountries() {
    this.countriesLoading = true;

    this.holidayCalendarService
      .getCountryOptions()
      .pipe(
        finalize(() => {
          this.countriesLoading = false;
        })
      )
      .subscribe(options => {
        this.countryOptions = options ?? [];
        this.countryLabelMap = this.buildCountryLabelMap(this.countryOptions);
        this.syncSelectedCountry();
      });
  }

  private syncSelectedCountry() {
    if (!this.countryOptions.length) {
      return;
    }

    const currentCountry = this.normalizeCountryCode(this.country);
    if (currentCountry && this.countryLabelMap[currentCountry]) {
      this.country = currentCountry;
      return;
    }

    const fallback = this.countryOptions.find(option => option.value === 'IT') ?? this.countryOptions[0];
    if (!fallback) {
      return;
    }

    this.country = fallback.value;
    this.load();
  }

  private buildCountryLabelMap(options: CountryOption[]): Record<string, string> {
    return options.reduce<Record<string, string>>((map, option) => {
      map[option.value] = option.label;
      return map;
    }, {});
  }

  private buildMonths(data: PublicHoliday[], year: number): MonthCard[] {
    const holidayMap = new Map<string, PublicHoliday>();

    data.forEach(holiday => {
      const isoDate = toIsoDate(holiday.date);
      if (!isoDate) {
        return;
      }

      holidayMap.set(isoDate, holiday);
    });

    return this.monthNames.map((monthName, monthIndex) => {
      const weeks = this.buildWeeks(monthIndex, year, holidayMap);
      const holidays: DayCell[] = [];
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIndex, day);
        const cell = this.buildDayCell(date, holidayMap);
        if (cell.isHoliday) {
          holidays.push(cell);
        }
      }

      return {
        monthName,
        year,
        weeks,
        holidays,
        holidayCount: holidays.length
      };
    });
  }

  private buildWeeks(month: number, year: number, holidayMap: Map<string, PublicHoliday>): (DayCell | null)[][] {
    const weeks: (DayCell | null)[][] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let week: (DayCell | null)[] = [];

    const firstDay = new Date(year, month, 1).getDay();
    const offset = (firstDay + 6) % 7;

    for (let i = 0; i < offset; i++) {
      week.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      week.push(this.buildDayCell(date, holidayMap));
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    return weeks;
  }

  private buildDayCell(date: Date, holidayMap: Map<string, PublicHoliday>): DayCell {
    const isoDate = toIsoDate(date);
    const holiday = holidayMap.get(isoDate);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = !!holiday;
    const label = holiday?.localName || holiday?.name || '';

    return {
      day: date.getDate(),
      date,
      dateLabel: toItalianDate(date),
      isWeekend,
      isHoliday,
      isOfficial: holiday?.global === true,
      label
    };
  }

  private normalizeCountryCode(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim().toUpperCase();
    return normalized ? normalized : null;
  }

  private normalizeYear(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return new Date().getFullYear();
    }

    return Math.max(1970, Math.trunc(value));
  }
}
