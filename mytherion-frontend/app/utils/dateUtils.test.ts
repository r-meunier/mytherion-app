import {
  getTimeDifference,
  formatRelativeTime,
  formatLocalizedDate,
  MS_PER_MINUTE,
  MS_PER_HOUR,
  MS_PER_DAY,
} from './dateUtils';

describe('dateUtils', () => {
  const baseTime = new Date('2026-06-15T12:00:00.000Z');

  describe('getTimeDifference', () => {
    it('returns default invalid object for null, undefined, or empty string', () => {
      expect(getTimeDifference(null, baseTime)).toEqual({
        diffTime: 0,
        diffMinutes: 0,
        diffHours: 0,
        diffDays: 0,
        isValid: false,
      });

      expect(getTimeDifference(undefined, baseTime)).toEqual({
        diffTime: 0,
        diffMinutes: 0,
        diffHours: 0,
        diffDays: 0,
        isValid: false,
      });

      expect(getTimeDifference('', baseTime)).toEqual({
        diffTime: 0,
        diffMinutes: 0,
        diffHours: 0,
        diffDays: 0,
        isValid: false,
      });
    });

    it('returns invalid for malformed date strings', () => {
      expect(getTimeDifference('not-a-date', baseTime).isValid).toBe(false);
    });

    it('calculates diffMinutes, diffHours, and diffDays correctly', () => {
      // 5 minutes ago
      const fiveMinutesAgo = new Date(baseTime.getTime() - 5 * MS_PER_MINUTE);
      const diff5m = getTimeDifference(fiveMinutesAgo, baseTime);
      expect(diff5m.diffMinutes).toBe(5);
      expect(diff5m.diffHours).toBe(0);
      expect(diff5m.diffDays).toBe(0);
      expect(diff5m.isValid).toBe(true);

      // 3 hours ago
      const threeHoursAgo = new Date(baseTime.getTime() - 3 * MS_PER_HOUR);
      const diff3h = getTimeDifference(threeHoursAgo, baseTime);
      expect(diff3h.diffMinutes).toBe(180);
      expect(diff3h.diffHours).toBe(3);
      expect(diff3h.diffDays).toBe(0);

      // 4 days ago
      const fourDaysAgo = new Date(baseTime.getTime() - 4 * MS_PER_DAY);
      const diff4d = getTimeDifference(fourDaysAgo, baseTime);
      expect(diff4d.diffDays).toBe(4);
    });

    it('clamps future dates (negative difference) to 0', () => {
      const futureDate = new Date(baseTime.getTime() + 10000);
      const diff = getTimeDifference(futureDate, baseTime);
      expect(diff.diffTime).toBe(0);
      expect(diff.diffMinutes).toBe(0);
      expect(diff.isValid).toBe(true);
    });
  });

  describe('formatRelativeTime', () => {
    it('returns empty string when dateInput is falsy', () => {
      expect(formatRelativeTime(null, baseTime)).toBe('');
      expect(formatRelativeTime(undefined, baseTime)).toBe('');
      expect(formatRelativeTime('', baseTime)).toBe('');
    });

    it('returns "Unknown date" for invalid date input', () => {
      expect(formatRelativeTime('invalid-date-string', baseTime)).toBe('Unknown date');
    });

    it('returns "Just now" for updates under 1 minute', () => {
      const underOneMin = new Date(baseTime.getTime() - 30 * 1000);
      expect(formatRelativeTime(underOneMin, baseTime)).toBe('Just now');
    });

    it('returns "Xm ago" for updates between 1 and 59 minutes', () => {
      const fiveMins = new Date(baseTime.getTime() - 5 * MS_PER_MINUTE);
      expect(formatRelativeTime(fiveMins, baseTime)).toBe('5m ago');

      const fiftyNineMins = new Date(baseTime.getTime() - 59 * MS_PER_MINUTE);
      expect(formatRelativeTime(fiftyNineMins, baseTime)).toBe('59m ago');
    });

    it('returns "Xh ago" for updates between 1 and 23 hours', () => {
      const oneHour = new Date(baseTime.getTime() - MS_PER_HOUR);
      expect(formatRelativeTime(oneHour, baseTime)).toBe('1h ago');

      const twentyThreeHours = new Date(baseTime.getTime() - 23 * MS_PER_HOUR);
      expect(formatRelativeTime(twentyThreeHours, baseTime)).toBe('23h ago');
    });

    it('returns "Yesterday" for updates 1 day ago', () => {
      const oneDayAgo = new Date(baseTime.getTime() - 25 * MS_PER_HOUR);
      expect(formatRelativeTime(oneDayAgo, baseTime)).toBe('Yesterday');
    });

    it('returns "Xd ago" for updates between 2 and 6 days ago', () => {
      const threeDaysAgo = new Date(baseTime.getTime() - 3 * MS_PER_DAY);
      expect(formatRelativeTime(threeDaysAgo, baseTime)).toBe('3d ago');

      const sixDaysAgo = new Date(baseTime.getTime() - 6 * MS_PER_DAY);
      expect(formatRelativeTime(sixDaysAgo, baseTime)).toBe('6d ago');
    });

    it('returns month and day for dates older than 7 days in the same year', () => {
      const twoWeeksAgo = new Date(baseTime.getTime() - 14 * MS_PER_DAY);
      expect(formatRelativeTime(twoWeeksAgo, baseTime)).toBe('Jun 1');
    });

    it('includes the year for dates from a previous calendar year', () => {
      const lastYear = new Date('2024-03-10T12:00:00.000Z');
      expect(formatRelativeTime(lastYear, baseTime)).toBe('Mar 10, 2024');
    });
  });

  describe('formatLocalizedDate', () => {
    it('returns empty string for null or undefined input', () => {
      expect(formatLocalizedDate(null)).toBe('');
      expect(formatLocalizedDate(undefined)).toBe('');
    });

    it('returns "Unknown date" for invalid date', () => {
      expect(formatLocalizedDate('invalid')).toBe('Unknown date');
    });

    it('formats valid date properly', () => {
      const date = new Date('2026-01-15T00:00:00.000Z');
      const formatted = formatLocalizedDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('2026');
    });
  });
});
