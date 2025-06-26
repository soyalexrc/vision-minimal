import { toZonedTime } from 'date-fns-tz';
import {
  parse,
  format,
  isEqual,
  getTime,
  isValid,
  isBefore,
  parseISO,
  isSameDay,
  isSameYear,
  isSameMonth,
  formatDistanceToNow,
  isAfter as dateIsAfter,
} from 'date-fns';

export type DatePickerFormat = Date | string | number | null | undefined;

export const formatPatterns = {
  dateTime: 'DD MMM YYYY h:mm a', // 17 Apr 2022 12:00 am
  date: 'dd-MM-yyyy', // 17 Apr 2022
  time: 'h:mm a', // 12:00 am
  split: {
    dateTime: 'yyyy/MM/dd h:mm a', // 17/04/2022 12:00 am
    date: 'DD/MM/YYYY', // 17/04/2022
  },
  paramCase: {
    dateTime: 'DD-MM-YYYY h:mm a', // 17-04-2022 12:00 am
    date: 'DD-MM-YYYY', // 17-04-2022
  },
};

// Format patterns for date-fns
export const formatPatterns2 = {
  date: 'dd/MM/yyyy',
  dateTime: 'dd/MM/yyyy HH:mm',
  time: 'HH:mm',

  // For more specific formats
  day: 'dd',
  month: 'MMM',
  monthYear: 'MMM yyyy',
  fullDate: 'EEEE, dd MMMM yyyy',
  fullDateTime: 'EEEE, dd MMMM yyyy HH:mm',

  // Additional formats
  shortDate: 'dd MMM',
  longDate: 'dd MMMM yyyy',
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
};

// ----------------------------------------------------------------------

export function fToDate(date: any, newFormat: string = 'yyyy-MM-dd') {
  return parse(date, newFormat, new Date());
}

// Función para convertir timestamp de PostgreSQL (asumiendo UTC)
export function parsePostgresTimestamp(timestamp: string): Date {
  // PostgreSQL timestamp sin zona horaria - asumimos UTC
  return new Date(timestamp + 'Z'); // Agregar 'Z' para indicar UTC
}

/**
 * Checks if a date is between two dates (inclusive)
 * Uses date-fns functions for more reliable date comparison
 */
export function fIsBetween(
  date: string | number | Date,
  startDate: string | number | Date,
  endDate: string | number | Date
): boolean {
  // Convert all inputs to Date objects
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check if date is equal to or after start AND equal to or before end
  return (
    (isEqual(checkDate, start) || dateIsAfter(checkDate, start)) &&
    (isEqual(checkDate, end) || isBefore(checkDate, end))
  );
}

/**
 * Checks if first date is after second date
 * Uses date-fns isAfter for more reliable comparison
 */
export function fIsAfter(
  date: string | number | Date,
  dateToCompare: string | number | Date
): boolean {
  if (!date || !dateToCompare) return false;

  return dateIsAfter(new Date(date), new Date(dateToCompare));
}

export function fDate(date: string | number | Date, newFormat?: string): string {
  const fm = newFormat || 'dd-MM-yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateUTC(date: string | number | Date, newFormat?: string): string {
  const fm = newFormat || 'dd-MM-yyyy';

  return date ? format(new Date(new Date(date).toUTCString().substring(0, 16)), fm) : '';
}

export function dateUTC(date: string | number | Date): Date | string | number {
  return date ? new Date(new Date(date).toUTCString().substring(0, 16)) : date;
}

export function dateTimeUTC(date: string | number | Date): Date | string | number {
  return date ? new Date(new Date(date).toUTCString().substring(0, 26)) : date;
}

export function fTime(date: string | number | Date, newFormat?: string): string {
  const fm = newFormat || 'p';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date: string | number | Date, newFormat?: string): string {
  const fm = newFormat || 'dd-MM-yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTimeVE(date: string | number | Date, newFormat?: string): string {
  const fm = newFormat || 'dd-MM-yyyy p';
  if (!date) return '';

  const parsedDate =
    typeof date === 'string' && !date.includes('T') ? parsePostgresTimestamp(date) : new Date(date);

  // Convertir a zona horaria de Venezuela (UTC-4)
  const veDate = new Date(parsedDate.getTime() - 4 * 60 * 60 * 1000);
  return format(veDate, fm);
}

// export function fDateTimeVE2(date: string | number | Date, newFormat?: string): string {
//   const fm = newFormat || 'dd-MM-yyyy HH:mm a';
//   if (!date) return '';
//
//   const parsedDate = typeof date === 'string' && !date.includes('T')
//     ? parsePostgresTimestamp(date)
//     : new Date(date);
//
//   // Convertir UTC a zona horaria de Venezuela
//   const veTime = toZonedTime(parsedDate, 'America/Caracas');
//   return format(veTime, fm);
// }

export function fDateRangeShortLabel(
  startDate: DatePickerFormat,
  endDate: DatePickerFormat,
  initial?: boolean
): string {
  if (!isValid(startDate) || !isValid(endDate) || fIsAfter(startDate!, endDate!)) {
    return 'Invalid date';
  }
  let label = `${fDate(startDate!)} - ${fDate(endDate!)}`;

  if (initial) {
    return label;
  }

  const sameYear = fIsSame(startDate, endDate, 'year');
  const sameMonth = fIsSame(startDate, endDate, 'month');
  const sameDay = fIsSame(startDate, endDate, 'day');

  if (sameYear && !sameMonth) {
    label = `${fDate(startDate!, 'DD MMM')} - ${fDate(endDate!)}`;
  } else if (sameYear && sameMonth && !sameDay) {
    label = `${fDate(startDate!, 'DD')} - ${fDate(endDate!)}`;
  } else if (sameYear && sameMonth && sameDay) {
    label = `${fDate(endDate!)}`;
  }

  return label;
}

export function fDateTimeVE2(
  date: string | number | Date,
  dateFormat?: string,
  timeFormat?: string
): {
  date: string;
  time: string;
} {
  const defaultDateFormat = dateFormat || 'dd-MM-yyyy';
  const defaultTimeFormat = timeFormat || 'h:mm a';

  if (!date) return { date: '', time: '' };

  const parsedDate =
    typeof date === 'string' && !date.includes('T') ? parsePostgresTimestamp(date) : new Date(date);

  // Convertir UTC a zona horaria de Venezuela
  const veTime = toZonedTime(parsedDate, 'America/Caracas');

  return {
    date: format(veTime, defaultDateFormat),
    time: format(veTime, defaultTimeFormat),
  };
}

export function fDateTimeUTC(date: string | number | Date): string {
  return date
    ? `${new Date(date).toLocaleDateString('es-VE', { timeZone: 'UTC' })} ${new Date(date).toLocaleTimeString('es-VE', { timeZone: 'UTC' })}`
    : '';
}

export function fTimestamp(date: string | number | Date): number | string {
  return date ? getTime(new Date(date)) : '';
}

export function fTimestampUTC(date: string | number | Date): number | string {
  return date ? getTime(new Date(`${fDateUTC(date, 'yyyy-MM-dd')}T00:00:00`)) : '';
}

export function fToNow(date: string | number | Date): string {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}

export function isBetween(
  inputDate: string | number | Date,
  startDate: Date,
  endDate: Date
): boolean {
  const date = new Date(inputDate);

  const results =
    new Date(date.toUTCString().substring(0, 16)) >= new Date(startDate.toDateString()) &&
    new Date(date.toUTCString().substring(0, 16)) <= new Date(endDate.toDateString());

  return results;
}

export function isAfter(
  startDate: string | number | Date,
  endDate: string | number | Date
): boolean {
  const results =
    startDate && endDate ? new Date(startDate).getTime() > new Date(endDate).getTime() : false;

  return results;
}

export function fIsSame(
  date1: string | number | Date | null | undefined,
  date2: string | number | Date | null | undefined,
  unit: 'year' | 'month' | 'day'
): boolean {
  if (!date1 || !date2) return false;

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  switch (unit) {
    case 'year':
      return isSameYear(d1, d2);
    case 'month':
      return isSameMonth(d1, d2);
    case 'day':
      return isSameDay(d1, d2);
    default:
      return false;
  }
}

// When sending date to backend/formatting
export const formatDateForBackend = (date: Date | string): string => {
  if (typeof date === 'string') {
    // If it's already a string date, add time to prevent timezone issues
    const dateWithTime = date.includes('T') ? date : `${date}T12:00:00`;
    return format(parseISO(dateWithTime), 'yyyy-MM-dd');
  }

  // If it's a Date object, format directly
  return format(date, 'yyyy-MM-dd');
};

// When receiving date from backend
export const parseDateFromBackend = (dateString: string): Date => {
  // Add time if not present to prevent timezone shift
  const dateWithTime = dateString.includes('T') ? dateString : `${dateString}T12:00:00`;
  return parseISO(dateWithTime);
};

// Create date from YYYY-MM-DD string without timezone shift
export function fromDateString(dateString: string): Date {
  if (!dateString) return new Date();

  // Split the date string and create date manually
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0); // Set to noon
}

// Format date to YYYY-MM-DD string
export function toDateString(date: Date): string {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Safe format for date-fns
export function formatSafe(date: Date | string, formatString: string) {
  if (typeof date === 'string') {
    return format(fromDateString(date), formatString);
  }
  return format(date, formatString);
}

export function getNumberofDay(stringDay: string): number | null {
  switch (stringDay) {
    case 'Domingo':
      return 0;
    case 'Lunes':
      return 1;
    case 'Martes':
      return 2;
    case 'Miércoles':
      return 3;
    case 'Jueves':
      return 4;
    case 'Viernes':
      return 5;
    case 'Sábado':
      return 6;
    default:
      return null;
  }
}
