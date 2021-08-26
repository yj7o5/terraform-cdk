import {
  asString,
  terraformFunction,
  stringValue,
  asBoolean,
  asList,
  mapValue,
} from "./lib";
import { IResolvable } from "../tokens/resolvable";

/**
 * {@link https://www.terraform.io/docs/language/functions/abspath.html abspath} takes a string containing a filesystem path and converts it to an absolute path.
 * @param {string} value
 */
export function abspath(value: string | IResolvable) {
  return asString(terraformFunction("abspath", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/dirname.html dirname} takes a string containing a filesystem path and removes the last portion from it.
 * @param {string} value
 */
export function dirname(value: string | IResolvable) {
  return asString(terraformFunction("dirname", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/pathexpand.html pathexpand} takes a string containing a filesystem path and removes the last portion from it.
 * @param {string} value
 */
export function pathexpand(value: string | IResolvable) {
  return asString(terraformFunction("pathexpand", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/basename.html basename} takes a string containing a filesystem path and removes all except the last portion from it.
 * @param {string} value
 */
export function basename(value: string | IResolvable) {
  return asString(terraformFunction("basename", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/file.html file} takes a string containing a filesystem path and removes all except the last portion from it.
 * @param {string} value
 */
export function file(value: string | IResolvable) {
  return asString(terraformFunction("file", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/fileexists.html fileexists} determines whether a file exists at a given path.
 * @param {string} value
 */
export function fileexists(value: string | IResolvable) {
  return asBoolean(terraformFunction("fileexists", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/fileset.html fileset} enumerates a set of regular file names given a path and pattern.
 * @param {string} path
 * @param {string} pattern
 */
export function fileset(
  path: string | IResolvable,
  pattern: string | IResolvable
) {
  return asList(
    terraformFunction("fileset", [stringValue, stringValue])(path, pattern)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/filebase64.html filebase64} reads the contents of a file at the given path and returns them as a base64-encoded string.
 * @param {string} value
 */
export function filebase64(value: string | IResolvable) {
  return asString(terraformFunction("filebase64", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/templatefile.html templatefile} reads the file at the given path and renders its content as a template using a supplied set of template variables.
 * @param {string} path
 * @param {Object} vars
 */
export function templatefile(path: string | IResolvable, vars: any) {
  return asString(
    terraformFunction("templatefile", [stringValue, mapValue])(path, vars)
  );
}
