/**
 * Class representing a date and time with utility methods.
 * Based on Flutter DateTime module.
 *
 * @license
 * MIT License
 *
 * @author Suraj Verma (gadgetvala)
 */

export enum Day {
  Sunday = 'Sunday',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
}

export default class GDateTime {
  private date: Date;

  /**
   * Creates an instance of GDateTime.
   * @param year - The year of the date.
   * @param month - The month of the date (1-12).
   * @param day - The day of the month.
   * @param hour - The hour of the day (default is 0).
   * @param minute - The minute of the hour (default is 0).
   * @param second - The second of the minute (default is 0).
   */
  constructor(
    year?: number,
    month?: number,
    day?: number,
    hour: number = 0,
    minute: number = 0,
    second: number = 0
  ) {
    if (year !== undefined && month !== undefined && day !== undefined) {
      this.date = new Date(year, month - 1, day, hour, minute, second);
    } else {
      this.date = new Date();
    }
  }

  /**
   * Creates an instance of GDateTime from a JavaScript Date object.
   * @param date - The JavaScript Date object.
   * @return The GDateTime instance.
   */
  static fromDate(date: Date): GDateTime {
    const gDateTime = new GDateTime();
    gDateTime.date = new Date(date);
    return gDateTime;
  }

  /**
   * Gets the day of the week as a string.
   * @return The day of the week (Sunday-Saturday).
   */
  get dayOfWeek(): Day {
    const daysOfWeek: Day[] = [
      Day.Sunday,
      Day.Monday,
      Day.Tuesday,
      Day.Wednesday,
      Day.Thursday,
      Day.Friday,
      Day.Saturday,
    ];

    return daysOfWeek[this.date.getDay()];
  }

  /**
   * Checks if today is a specific day of the week.
   * @param day - The day of the week to check.
   * @return True if today matches the specified day, false otherwise.
   */
  isToday(day: Day): boolean {
    return this.dayOfWeek === day;
  }

  /**
   * Convenience method to check if today is Sunday.
   * @return True if today is Monday, false otherwise.
   */
  isTodaySunday(): boolean {
    return this.isToday(Day.Sunday);
  }

  isTodayMonday(): boolean {
    return this.isToday(Day.Monday);
  }

  isTodayTuesday(): boolean {
    return this.isToday(Day.Tuesday);
  }

  isTodayWednesday(): boolean {
    return this.isToday(Day.Wednesday);
  }

  isTodayThursday(): boolean {
    return this.isToday(Day.Thursday);
  }

  isTodayFriday(): boolean {
    return this.isToday(Day.Friday);
  }

  isTodaySaturday(): boolean {
    return this.isToday(Day.Saturday);
  }

  /**
   * Gets the year of the date.
   * @return The year.
   */
  get year(): number {
    return this.date.getFullYear();
  }

  /**
   * Gets the month of the date (1-12).
   * @return The month.
   */
  get month(): number {
    return this.date.getMonth() + 1;
  }

  /**
   * Gets the day of the date.
   * @return The day.
   */
  get day(): number {
    return this.date.getDate();
  }

  /**
   * Gets the hour of the date.
   * @return The hour.
   */
  get hour(): number {
    return this.date.getHours();
  }

  /**
   * Gets the minute of the date.
   * @return The minute.
   */
  get minute(): number {
    return this.date.getMinutes();
  }

  /**
   * Gets the second of the date.
   * @return The second.
   */
  get second(): number {
    return this.date.getSeconds();
  }

  /**
   * Gets the date object.
   * @return The date object.
   */
  get dateObj(): Date {
    return this.date;
  }

  /**
   * Adds years to the date.
   * @param years - The number of years to add.
   * @return The updated GDateTime instance.
   */
  addYears(years: number): GDateTime {
    this.date.setFullYear(this.date.getFullYear() + years);
    return this;
  }

  /**
   * Adds months to the date.
   * @param months - The number of months to add.
   * @return The updated GDateTime instance.
   */
  addMonths(months: number): GDateTime {
    this.date.setMonth(this.date.getMonth() + months);
    return this;
  }

  /**
   * Adds days to the date.
   * @param days - The number of days to add.
   * @return The updated GDateTime instance.
   */
  addDays(days: number): GDateTime {
    this.date.setDate(this.date.getDate() + days);
    return this;
  }

  /**
   * Adds hours to the date.
   * @param hours - The number of hours to add.
   * @return The updated GDateTime instance.
   */
  addHours(hours: number): GDateTime {
    this.date.setHours(this.date.getHours() + hours);
    return this;
  }

  /**
   * Adds minutes to the date.
   * @param minutes - The number of minutes to add.
   * @return The updated GDateTime instance.
   */
  addMinutes(minutes: number): GDateTime {
    this.date.setMinutes(this.date.getMinutes() + minutes);
    return this;
  }

  /**
   * Adds seconds to the date.
   * @param seconds - The number of seconds to add.
   * @return The updated GDateTime instance.
   */
  addSeconds(seconds: number): GDateTime {
    this.date.setSeconds(this.date.getSeconds() + seconds);
    return this;
  }

  /**
   * Checks if the current date is after the given date.
   * @param other - The other GDateTime instance to compare with.
   * @return True if the current date is after the given date, false otherwise.
   */
  isAfter(other: GDateTime): boolean {
    return this.date > other.date;
  }

  /**
   * Checks if the current date is before the given date.
   * @param other - The other GDateTime instance to compare with.
   * @return True if the current date is before the given date, false otherwise.
   */
  isBefore(other: GDateTime): boolean {
    return this.date < other.date;
  }

  /**
   * Checks if the current date is in the future.
   * @return True if the date is after the current date, false otherwise.
   */
  isFuture(): boolean {
    return this.date > new Date();
  }

  /**
   * Checks if the current date is in the past.
   * @return True if the date is before the current date, false otherwise.
   */
  isPast(): boolean {
    return this.date < new Date();
  }

  /**
   * Checks if the current date is equal to the given date.
   * @param other - The other GDateTime instance to compare with.
   * @return True if the current date is equal to the given date, false otherwise.
   */
  isEqual(other: GDateTime): boolean {
    return this.date.getTime() === other.date.getTime();
  }

  /**
   * Formats the date as "1 Aug 2024".
   * @return The formatted date string.
   */
  formatDate(seprator: string = ' '): string {
    const day = this.date.getDate();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[this.date.getMonth()];
    const year = this.date.getFullYear();
    return `${day}${seprator}${month}${seprator}${year}`;
  }

  /**
   * Formats the time as "HH:MM:SS".
   * @return The formatted time string.
   */
  formatTime(): string {
    const hours = this.date.getHours().toString().padStart(2, '0');
    const minutes = this.date.getMinutes().toString().padStart(2, '0');
    const seconds = this.date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
}
