/**
 * Utility functions for handling timestamps and date formatting
 * All timestamps are in Sri Lankan timezone (GMT +5:30)
 */

/**
 * Formats a Sri Lankan timestamp string to a localized date string
 * @param timestamp - ISO string or timestamp from backend (in Sri Lankan timezone)
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string in Sri Lankan timezone
 */
export function formatDate(
  timestamp: string | Date, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Colombo'
  }
): string {
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp provided:', timestamp);
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Formats a Sri Lankan timestamp string to a localized time string
 * @param timestamp - ISO string or timestamp from backend (in Sri Lankan timezone)
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted time string in Sri Lankan timezone
 */
export function formatTime(
  timestamp: string | Date,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Colombo'
  }
): string {
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp provided:', timestamp);
      return 'Invalid Time';
    }
    
    return date.toLocaleTimeString('en-US', options);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
}

/**
 * Formats a Sri Lankan timestamp string to a localized date and time string
 * @param timestamp - ISO string or timestamp from backend (in Sri Lankan timezone)
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date and time string in Sri Lankan timezone
 */
export function formatDateTime(
  timestamp: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Colombo'
  }
): string {
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp provided:', timestamp);
      return 'Invalid Date';
    }
    
    return date.toLocaleString('en-US', options);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid Date';
  }
}

/**
 * Gets the relative time (e.g., "2 hours ago", "3 days ago")
 * @param timestamp - ISO string or timestamp from backend (in Sri Lankan timezone)
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: string | Date): string {
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp provided:', timestamp);
      return 'Invalid Date';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return formatDate(timestamp);
    }
  } catch (error) {
    console.error('Error getting relative time:', error);
    return 'Invalid Date';
  }
}

/**
 * Converts a Sri Lankan timestamp to a Date object
 * @param timestamp - ISO string or timestamp from backend (in Sri Lankan timezone)
 * @returns Date object
 */
export function toLocalTime(timestamp: string | Date): Date {
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp provided:', timestamp);
      return new Date();
    }
    
    return date;
  } catch (error) {
    console.error('Error converting to local time:', error);
    return new Date();
  }
}

/**
 * Gets the current timezone offset in minutes
 * @returns Timezone offset in minutes
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * Gets the Sri Lankan timezone name
 * @returns Timezone name "Asia/Colombo"
 */
export function getTimezoneName(): string {
  return 'Asia/Colombo';
}
