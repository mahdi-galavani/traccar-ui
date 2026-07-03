export class TimeUtils {

  static parseUTC(value: string): Date {
    return new Date(value); // فقط برای UTC math
  }

  static toUTCMinutes(date: Date): number {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
  }

  static formatUTC(value: string): string {
    const d = new Date(value);
    return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
  }

  static getUTCDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static getISOWeekDay(date: Date): number {
    return (date.getUTCDay() + 6) % 7;
  }
}
