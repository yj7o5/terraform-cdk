import { IResolvable } from "../tokens/resolvable";
import {
  asString,
  terraformFunction,
  stringValue,
  anyValue,
  asAny,
  asList,
} from "./lib";

/**
 * {@link https://www.terraform.io/docs/language/functions/base64decode.html base64decode} takes a string containing a Base64 character sequence and returns the original string.
 * @param {string} value
 */
export function base64decode(value: string | IResolvable) {
  return asString(terraformFunction("base64decode", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/base64encode.html base64encode} takes a string containing a Base64 character sequence and returns the original string.
 * @param {string} value
 */
export function base64encode(value: string | IResolvable) {
  return asString(terraformFunction("base64encode", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/base64gzip.html base64gzip} compresses a string with gzip and then encodes the result in Base64 encoding.
 * @param {string} value
 */
export function base64gzip(value: string | IResolvable) {
  return asString(terraformFunction("base64gzip", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/csvdecode.html csvdecode} decodes a string containing CSV-formatted data and produces a list of maps representing that data.
 * @param {string} value
 */
export function csvdecode(value: string | IResolvable) {
  return asList(terraformFunction("csvdecode", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/jsondecode.html jsondecode} interprets a given string as JSON, returning a representation of the result of decoding that string.
 * @param {string} value
 */
export function jsondecode(value: string | IResolvable) {
  return asAny(terraformFunction("jsondecode", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/jsonencode.html jsonencode} encodes a given value to a string using JSON syntax.
 * @param {any} value
 */
export function jsonencode(value: any) {
  return asString(terraformFunction("jsonencode", [anyValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/textdecodebase64.html textdecodebase64} function decodes a string that was previously Base64-encoded, and then interprets the result as characters in a specified character encoding.
 * @param {string} value
 * @param {string} encodingName
 */
export function textdecodebase64(
  value: string | IResolvable,
  encodingName: string | IResolvable
) {
  return asString(
    terraformFunction("textdecodebase64", [stringValue, stringValue])(
      value,
      encodingName
    )
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/textencodebase64.html textencodebase64}  encodes the unicode characters in a given string using a specified character encoding, returning the result base64 encoded because Terraform language strings are always sequences of unicode characters.
 * @param {string} value
 * @param {string} encodingName
 */
export function textencodebase64(
  value: string | IResolvable,
  encodingName: string | IResolvable
) {
  return asString(
    terraformFunction("textencodebase64", [stringValue, stringValue])(
      value,
      encodingName
    )
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/urlencode.html urlencode} applies URL encoding to a given string.
 * @param {string} value
 */
export function urlencode(value: string | IResolvable) {
  return asString(terraformFunction("urlencode", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/yamldecode.html yamldecode} parses a string as a subset of YAML, and produces a representation of its value.
 * @param {string} value
 */
export function yamldecode(value: string | IResolvable) {
  return asAny(terraformFunction("yamldecode", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/yamlencode.html yamlencode} encodes a given value to a string using JSON syntax.
 * @param {any} value
 */
export function yamlencode(value: any) {
  return asString(terraformFunction("yamlencode", [anyValue])(value));
}
