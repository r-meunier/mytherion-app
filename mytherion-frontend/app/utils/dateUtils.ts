/**
 * Date and time formatting utilities for Mytherion cards and UI components.
 */

export interface TimeDifference {
  diffTime: number;
  diffMinutes: number;
  diffHours: number;
  diffDays: number;
  isValid: boolean;
}

export const MS_PER_MINUTE = 1000 * 60;
export const MS_PER_HOUR = MS_PER_MINUTE * 60;
export const MS_PER_DAY = MS_PER_HOUR * 24;

/**
 * Calculates the time elapsed between a given date and a base date (defaults to now).
 */
export function getTimeDifference(
  dateInput?: string | number | Date | null,
  baseDate: Date = new Date()
): TimeDifference {
  if (!dateInput) {
    return { diffTime: 0, diffMinutes: 0, diffHours: 0, diffDays: 0, isValid: false };
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return { diffTime: 0, diffMinutes: 0, diffHours: 0, diffDays: 0, isValid: false };
  }

  const diffTime = Math.max(0, baseDate.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffTime / MS_PER_MINUTE);
  const diffHours = Math.floor(diffTime / MS_PER_HOUR);
  const diffDays = Math.floor(diffTime / MS_PER_DAY);

  return {
    diffTime,
    diffMinutes,
    diffHours,
    diffDays,
    isValid: true,
  };
}

/**
 * Formats a timestamp into a progressive relative time string:
 * - < 1 min: "Just now"
 * - < 60 mins: "${diffMinutes}m ago"
 * - < 24 hours: "${diffHours}h ago"
 * - 1 day: "Yesterday"
 * - < 7 days: "${diffDays}d ago"
 * - Different year: "MMM d, yyyy" (e.g. "Jan 20, 2024")
 * - Same year: "MMM d" (e.g. "Jan 20")
 */
export function formatRelativeTime(
  dateInput?: string | number | Date | null,
  baseDate: Date = new Date(),
  locale = "en-US"
): string {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Unknown date";

  const { diffMinutes, diffHours, diffDays } = getTimeDifference(date, baseDate);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  if (date.getFullYear() !== baseDate.getFullYear()) {
    return date.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
  }
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

/**
 * Formats a timestamp into a standard localized date string with a fallback.
 */
export function formatLocalizedDate(
  dateInput?: string | number | Date | null,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" },
  locale = "en-US"
): string {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString(locale, options);
}
