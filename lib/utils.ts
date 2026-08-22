import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple CSS class names with Tailwind CSS deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric amount to standard currency representation (USD default).
 */
export function formatCurrency(amount: number | null | undefined, currency: string = 'USD'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats date string to localized readable format.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats time string to localized 12-hour format.
 */
export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return '—';
  try {
    const d = new Date(timeString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return timeString;
  }
}
