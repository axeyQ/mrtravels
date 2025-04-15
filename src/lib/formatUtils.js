// src/lib/formatUtils.js
import { format } from 'date-fns';

/**
 * Format a date using date-fns
 * @param {Date} date - The date to format
 * @param {string} formatString - Format string (date-fns style)
 * @returns {string} - Formatted date string
 */
export function formatDate(date, formatString) {
  if (!date) return '';
  try {
    return format(date, formatString);
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted amount
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '0.00';
  return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}