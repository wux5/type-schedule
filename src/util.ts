import { parseExpression } from "cron-parser";

export function isValidDate(date: Date) {
  if (date) {
    return !isNaN(date.getTime());
  } else {
    return false;
  }
}

export function parseCron(rule: string, options?: object): any {
  let expr: any;
  try {
    expr = parseExpression(rule, options, null);
  } catch (err) {
    expr = null;
  }
  return expr;
}
