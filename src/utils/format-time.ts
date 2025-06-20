import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import {
  parse,
  format,
  isEqual,
  getTime,
  isBefore,
  formatISO,
  isSameDay,
  isSameYear,
  isSameMonth,
  formatDistanceToNow,
  isAfter as dateIsAfter,
  isValid,
} from 'date-fns';

export type DatePickerFormat =  Date | string | number | null | undefined;

// ----------------------------------------------------------------------

export function fToDate(date: any, newFormat: string = 'yyyy-MM-dd') {
  return parse(date, newFormat, new Date())
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
  return (isEqual(checkDate, start) || dateIsAfter(checkDate, start)) &&
    (isEqual(checkDate, end) || isBefore(checkDate, end));
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

  const parsedDate = typeof date === 'string' && !date.includes('T')
    ? parsePostgresTimestamp(date)
    : new Date(date);

  // Convertir a zona horaria de Venezuela (UTC-4)
  const veDate = new Date(parsedDate.getTime() - (4 * 60 * 60 * 1000));
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


  export function fDateTimeVE2(date: string | number | Date, dateFormat?: string, timeFormat?: string): {
    date: string;
    time: string
  } {
    const defaultDateFormat = dateFormat || 'dd-MM-yyyy';
    const defaultTimeFormat = timeFormat || 'HH:mm a';

    if (!date) return { date: '', time: '' };

    const parsedDate = typeof date === 'string' && !date.includes('T')
      ? parsePostgresTimestamp(date)
      : new Date(date);

    // Convertir UTC a zona horaria de Venezuela
    const veTime = toZonedTime(parsedDate, 'America/Caracas');

    return {
      date: format(veTime, defaultDateFormat),
      time: format(veTime, defaultTimeFormat)
    };
  }

  export function fDateTimeUTC(date: string | number | Date): string {
    return date ? `${new Date(date).toLocaleDateString('es-VE', { timeZone: 'UTC' })} ${new Date(date).toLocaleTimeString('es-VE', { timeZone: 'UTC' })}` : '';
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

  export function isBetween(inputDate: string | number | Date, startDate: Date, endDate: Date): boolean {
    const date = new Date(inputDate);

    const results =
      new Date(date.toUTCString().substring(0, 16)) >= new Date(startDate.toDateString()) &&
      new Date(date.toUTCString().substring(0, 16)) <= new Date(endDate.toDateString());

    return results;
  }

  export function isAfter(startDate: string | number | Date, endDate: string | number | Date): boolean {
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
