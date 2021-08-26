import { IResolvable } from "../tokens/resolvable";
import {
  asNumber,
  terraformFunction,
  numericValue,
  listOf,
  stringValue,
} from "./lib";

/**
 * {@link https://www.terraform.io/docs/language/functions/abs.html abs} returns the absolute value of the given number
 * @param {number} value
 */
export function abs(value: number | IResolvable) {
  return asNumber(terraformFunction("abs", [numericValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/ceil.html ceil} returns the closest whole number that is greater than or equal to the given value, which may be a fraction.
 * @param {number} value
 */
export function ceil(value: number | IResolvable) {
  return asNumber(terraformFunction("ceil", [numericValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/floor.html floor} returns the closest whole number that is less than or equal to the given value, which may be a fraction
 * @param {number} value
 */
export function floor(value: number | IResolvable) {
  return asNumber(terraformFunction("floor", [numericValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/log.html log} returns the logarithm of a given number in a given base.
 * @param {number} value
 * @param {number} base
 */
export function log(value: number | IResolvable, base: number | IResolvable) {
  return asNumber(
    terraformFunction("log", [numericValue, numericValue])(value, base)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/max.html max} takes one or more numbers and returns the greatest number from the set.
 * @param {Array<number>} values
 */
export function max(values: (number | IResolvable)[]) {
  return asNumber(terraformFunction("max", listOf(numericValue))(...values));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/min.html min} takes one or more numbers and returns the smallest number from the set.
 * @param {Array<number>} values
 */
export function min(values: (number | IResolvable)[]) {
  return asNumber(terraformFunction("min", listOf(numericValue))(...values));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/parseint.html parseInt} parses the given string as a representation of an integer in the specified base and returns the resulting number. The base must be between 2 and 62 inclusive.
 * @param {string} value
 * @param {number} base
 */
export function parseInt(
  value: string | IResolvable,
  base: number | IResolvable
) {
  return asNumber(
    terraformFunction("parseInt", [stringValue, numericValue])(value, base)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/pow.html pow} calculates an exponent, by raising its first argument to the power of the second argument.
 * @param {number} value
 * @param {number} power
 */
export function pow(value: number | IResolvable, power: number | IResolvable) {
  return asNumber(
    terraformFunction("pow", [numericValue, numericValue])(value, power)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/signum.html signum} determines the sign of a number, returning a number between -1 and 1 to represent the sign.
 * @param {number} value
 */
export function signum(value: number | IResolvable) {
  return asNumber(terraformFunction("signum", [numericValue])(value));
}
