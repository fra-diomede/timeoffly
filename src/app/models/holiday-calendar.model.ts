export interface AvailableCountry {
  countryCode: string;
  name: string;
}

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  global: boolean;
  counties?: string[] | null;
  launchYear?: number | null;
  types?: string[] | null;
}

export interface CountryOption {
  label: string;
  value: string;
}
