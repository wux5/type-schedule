import Range from './range';
import * as CronDate from 'cron-parser/lib/date';

export type RuleData = number | string | Range | Array<number | string | Range> | null;

export default class RecurrenceRule {
  recurs: boolean = true;
  startDate: Date;
  endDate: Date;
  year: RuleData;
  month: RuleData;
  date: RuleData;
  dayOfWeek: RuleData;
  hour: RuleData;
  minute: RuleData;
  second: RuleData = 0;

  constructor(year: RuleData = null, month: RuleData = null, date: RuleData | Range = null, dayOfWeek: RuleData = null, hour: RuleData = null, minute: RuleData = null, second: number = 0, start: Date = null, end: Date = null) {
    this.year = year;
    this.month = month;
    this.date = date;
    this.dayOfWeek = dayOfWeek;
    this.hour = hour;
    this.minute = minute;
    this.second = second || 0;
    this.startDate = start;
    this.endDate = end;
  }

  isValid(): boolean {
    function isValidType(val: RuleData): boolean {
      if (Array.isArray(val)) {
        return val.every(e => isValidType(e));
      }
      return !(isNaN(Number(val)) && !(val instanceof Range));
    }
    let val: RuleData = this.month;
    if (val !== null && (val < 0 || val > 11 || !isValidType(val))) {
      return false;
    }
    val = this.dayOfWeek;
    if (val !== null && (val < 0 || val > 6 || !isValidType(val))) {
      return false;
    }
    val = this.hour;
    if (val !== null && (val < 0 || val > 23 || !isValidType(val))) {
      return false;
    }
    val = this.minute;
    if (val !== null && (val < 0 || val > 59 || !isValidType(val))) {
      return false;
    }
    val = this.second;
    if (val !== null && (val < 0 || val > 59 || !isValidType(val))) {
      return false;
    }
    val = this.date;
    if (val !== null) {
      if (!isValidType(val)) {
        return false;
      }
      switch (this.month) {
        case 3:
        case 5:
        case 8:
        case 10:
          if (val < 1 || val > 30) {
            return false;
          }
          break;
        case 1:
          if (val < 1 || val > 29) {
            return false;
          }
          break;
        default:
          if (val < 1 || val > 31) {
            return false;
          }
      }
    }
    return true;
  }

  nextInvocationDate(base: CronDate | Date = new Date()): Date {
    base = base || new Date();
    if (!this.recurs || !this.isValid()) {
      return null;
    }
    const now: CronDate = new CronDate(Date.now());
    let fullYear: number = now.getFullYear();
    if (this.year !== null &&
      typeof this.year === 'number' &&
      this.year < fullYear) {
      return null;
    }

    let next: CronDate = new CronDate(base.getTime());
    next.addSecond();

    while (true) {
      if (this.year !== null) {
        fullYear = next.getFullYear();
        if (typeof this.year === 'number' && this.year < fullYear) {
          next = null;
          break;
        }

        if (!recurMatch(fullYear, this.year)) {
          next.addYear();
          next.setMonth(0);
          next.setDate(1);
          next.setHours(0);
          next.setMinutes(0);
          next.setSeconds(0);
          continue;
        }
      }
      if (this.month !== null && !recurMatch(next.getMonth(), this.month)) {
        next.addMonth();
        continue;
      }
      if (this.date !== null && !recurMatch(next.getDate(), this.date)) {
        next.addDay();
        continue;
      }
      if (this.dayOfWeek !== null && !recurMatch(next.getDay(), this.dayOfWeek)) {
        next.addDay();
        continue;
      }
      if (this.hour !== null && !recurMatch(next.getHours(), this.hour)) {
        next.addHour();
        continue;
      }
      if (this.minute !== null && !recurMatch(next.getMinutes(), this.minute)) {
        next.addMinute();
        continue;
      }
      if (this.second !== null && !recurMatch(next.getSeconds(), this.second)) {
        next.addSecond();
        continue;
      }
      break;
    }
    return next ? next.toDate() : null;
  }
}

function recurMatch(val: number, matcher: RuleData): boolean {
  if (matcher === null) {
    return true;
  }

  if (typeof matcher === 'number') {
    return val === matcher;
  }
  if (typeof matcher === 'string') {
    return val === Number(matcher);
  }
  if (matcher instanceof Range) {
    return matcher.contains(val);
  }
  for (let i = 0; i < matcher.length; i++) {
    if (recurMatch(val, matcher[i])) {
      return true;
    }
  }
  return false;
}
