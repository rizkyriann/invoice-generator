import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

/**
 * Format a date string to a human-readable format
 */
export function formatDate(date: string | Date, format: string = 'DD MMM YYYY'): string {
  return dayjs(date).format(format);
}

/**
 * Format a date for form inputs (YYYY-MM-DD)
 */
export function formatDateForInput(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function getToday(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * Parse payment terms and calculate due date from issue date
 */
export function calculateDueDate(issueDate: string, paymentTerms: string): string {
  const terms = paymentTerms.toLowerCase();
  
  // Handle "Due on Receipt"
  if (terms.includes('receipt') || terms.includes('immediately')) {
    return issueDate;
  }

  // Handle "Net X" patterns (Net 15, Net 30, Net 60, etc.)
  const netMatch = terms.match(/net\s*(\d+)/i);
  if (netMatch) {
    const days = parseInt(netMatch[1], 10);
    return dayjs(issueDate).add(days, 'day').format('YYYY-MM-DD');
  }

  // Handle "X days" patterns
  const daysMatch = terms.match(/(\d+)\s*days?/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    return dayjs(issueDate).add(days, 'day').format('YYYY-MM-DD');
  }

  // Default to 30 days if can't parse
  return dayjs(issueDate).add(30, 'day').format('YYYY-MM-DD');
}

/**
 * Add days to a date
 */
export function addDays(date: string | Date, days: number): string {
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD');
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: string | Date, days: number): string {
  return dayjs(date).subtract(days, 'day').format('YYYY-MM-DD');
}

/**
 * Check if a date is in the past
 */
export function isPast(date: string | Date): boolean {
  return dayjs(date).isBefore(dayjs(), 'day');
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: string | Date): boolean {
  return dayjs(date).isAfter(dayjs(), 'day');
}

/**
 * Get the difference in days between two dates
 */
export function daysDifference(date1: string | Date, date2: string | Date): number {
  return dayjs(date1).diff(dayjs(date2), 'day');
}

/**
 * Get a relative time description (e.g., "2 days ago", "in 5 days")
 */
export function getRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

/**
 * Validate if a string is a valid date
 */
export function isValidDate(date: string): boolean {
  return dayjs(date, 'YYYY-MM-DD', true).isValid();
}

/**
 * Get quick payment term presets
 */
export const PAYMENT_TERM_PRESETS = [
  { label: 'Due on Receipt', value: 'Due on Receipt', days: 0 },
  { label: 'Net 15', value: 'Net 15', days: 15 },
  { label: 'Net 30', value: 'Net 30', days: 30 },
  { label: 'Net 60', value: 'Net 60', days: 60 },
  { label: 'Net 90', value: 'Net 90', days: 90 },
];
