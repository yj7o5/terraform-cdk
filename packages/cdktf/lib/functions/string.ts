import { IResolvable } from "../tokens/resolvable";
import {
  asString,
  terraformFunction,
  stringValue,
  asList,
  listOf,
  anyValue,
  numericValue,
  asNumber,
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

/**
 * {@link https://www.terraform.io/docs/language/functions/chomp.html chomp} removes newline characters at the end of a string.
 * @param {string} value
 */
export function chomp(value: string | IResolvable) {
  return asString(terraformFunction("chomp", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/format.html format} produces a string by formatting a number of other values according to a specification string
 * @param {string} spec
 * @param {Array} values
 */
export function format(spec: string | IResolvable, values: any[]) {
  return asString(
    terraformFunction("format", listOf(anyValue))(spec, ...values)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/formatlist.html formatlist} produces a list of strings by formatting a number of other values according to a specification string.
 * @param {string} spec
 * @param {Array<string>} values
 */
export function formatlist(spec: string | IResolvable, values: any[]) {
  return asList(
    terraformFunction("formatlist", listOf(anyValue))(spec, ...values)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/indent.html indent} adds a given number of spaces to the beginnings of all but the first line in a given multi-line string.
 * @param {number} indentation
 * @param {string} value
 */
export function indent(
  indentation: number | IResolvable,
  value: string | IResolvable
) {
  return asString(
    terraformFunction("indent", [numericValue, stringValue])(indentation, value)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/join.html join} produces a string by concatenating together all elements of a given list of strings with the given delimiter.
 * @param {string} separator
 * @param {Array} value
 */
export function join(
  separator: string | IResolvable,
  value: (string | IResolvable)[]
) {
  return asString(
    terraformFunction("join", [stringValue, listOf(anyValue)])(separator, value)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/lower.html lower} converts all cased letters in the given string to lowercase.
 * @param {string} value
 */
export function lower(value: string | IResolvable) {
  return asString(terraformFunction("lower", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/regexall.html regexall} applies a regular expression to a string and returns a list of all matches.
 * @param {string} pattern
 * @param {string} value
 */
export function regexall(
  pattern: string | IResolvable,
  value: string | IResolvable
) {
  return asList(
    terraformFunction("regexall", [stringValue, stringValue])(pattern, value)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/split.html replace} searches a given string for another given substring, and replaces each occurrence with a given replacement string.
 * @param {string} value
 * @param {string} substring
 * @param {string} replacement
 */
export function replace(
  value: string | IResolvable,
  substring: string | IResolvable,
  replacement: string | IResolvable
) {
  return asString(
    terraformFunction("replace", [stringValue, stringValue, stringValue])(
      value,
      substring,
      replacement
    )
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/split.html split} produces a list by dividing a given string at all occurrences of a given separator.
 * @param {string} seperator
 * @param {string} value
 */
export function split(
  seperator: string | IResolvable,
  value: string | IResolvable
) {
  return asList(
    terraformFunction("split", [stringValue, stringValue])(seperator, value)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/strrev.html strrev} reverses the characters in a string.
 * @param {string} value
 */
export function strrev(value: string | IResolvable) {
  return asString(terraformFunction("strrev", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/substr.html substr} extracts a substring from a given string by offset and length.
 * @param {string} value
 * @param {number} offset
 * @param {number} length
 */
export function substr(
  value: string | IResolvable,
  offset: number | IResolvable,
  length: number | IResolvable
) {
  return asString(
    terraformFunction("substr", [stringValue, numericValue, numericValue])(
      value,
      offset,
      length
    )
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/title.html title} converts the first letter of each word in the given string to uppercase.
 * @param {string} value
 */
export function title(value: string | IResolvable) {
  return asString(terraformFunction("title", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/trim.html trim} removes the specified characters from the start and end of the given string.
 * @param {string} value
 * @param {string} replacement
 */
export function trim(
  value: string | IResolvable,
  replacement: string | IResolvable
) {
  return asString(
    terraformFunction("trim", [stringValue, stringValue])(value, replacement)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/trimprefix.html trimprefix} removes the specified prefix from the start of the given string.
 * @param {string} value
 * @param {string} prefix
 */
export function trimprefix(
  value: string | IResolvable,
  prefix: string | IResolvable
) {
  return asString(
    terraformFunction("trimprefix", [stringValue, stringValue])(value, prefix)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/trimsuffix.html trimsuffix} removes the specified suffix from the end of the given string.
 * @param {string} value
 * @param {string} suffix
 */
export function trimsuffix(
  value: string | IResolvable,
  suffix: string | IResolvable
) {
  return asString(
    terraformFunction("trimsuffix", [stringValue, stringValue])(value, suffix)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/trimspace.html trimspace} removes any space characters from the start and end of the given string.
 * @param {string} value
 */
export function trimspace(value: string | IResolvable) {
  return asString(terraformFunction("trimspace", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/upper.html upper} converts all cased letters in the given string to uppercase.
 * @param {string} value
 */
export function upper(value: string | IResolvable) {
  return asString(terraformFunction("upper", [stringValue])(value));
}
