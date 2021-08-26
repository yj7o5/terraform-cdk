import {
  asBoolean,
  terraformFunction,
  anyValue,
  asList,
  asAny,
  asNumber,
  asString,
  listOf,
} from "./lib";

/**
 * {@link https://www.terraform.io/docs/language/functions/can.html can} evaluates the given expression and returns a boolean value indicating whether the expression produced a result without any errors.
 * @param {any} expression
 */
export function can(expression: any) {
  return asBoolean(terraformFunction("can", [anyValue])(expression));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/nonsensitive.html nonsensitive} takes a sensitive value and returns a copy of that value with the sensitive marking removed, thereby exposing the sensitive value.
 * @param {any} expression
 */
export function nonsensitive(expression: any) {
  return asAny(terraformFunction("nonsensitive", [anyValue])(expression));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/sensitive.html sensitive} takes any value and returns a copy of it marked so that Terraform will treat it as sensitive, with the same meaning and behavior as for sensitive input variables.
 * @param {any} expression
 */
export function sensitive(expression: any) {
  return asAny(terraformFunction("sensitive", [anyValue])(expression));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/tobool.html tobool} converts its argument to a boolean value.
 * @param {any} expression
 */
export function tobool(expression: any) {
  return asBoolean(terraformFunction("tobool", [anyValue])(expression));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/tolist.html tolist} converts its argument to a list value.
 * @param {any} expression
 */
export function tolist(expression: any) {
  return asList(terraformFunction("tolist", [anyValue])(expression));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/tomap.html tomap} converts its argument to a map value.
 * @param {any} expression
 */
export function tomap(expression: any) {
  return asAny(terraformFunction("tomap", [anyValue])(expression));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/tonumber.html tonumber} converts its argument to a number value.
 * @param {any} expression
 */
export function tonumber(expression: any) {
  return asNumber(terraformFunction("tonumber", [anyValue])(expression));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/toset.html toset} converts its argument to a set value.
 * @param {any} expression
 */
export function toset(expression: any) {
  return asAny(terraformFunction("toset", [anyValue])(expression));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/tostring.html tostring} converts its argument to a string value.
 * @param {any} expression
 */
export function tostring(expression: any) {
  return asString(terraformFunction("tostring", [anyValue])(expression));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/try.html try} evaluates all of its argument expressions in turn and returns the result of the first one that does not produce any errors.
 * @param {Array} expression
 */
export function tryExpression(expression: any[]) {
  return asAny(terraformFunction("try", listOf(anyValue))(...expression));
}
