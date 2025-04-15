// src/lib/dateUtils.js
import { format as dateFnsFormat } from 'date-fns';

/**
 * Format a date using date-fns
 * @param {Date} date - The date to format
 * @param {string} formatString - Format string (date-fns style)
 * @returns {string} - Formatted date string
 */
export function formatDate(date, formatString) {
  if (!date) return '';
  try {
    return dateFnsFormat(date, formatString);
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
}