import {
  asString,
  terraformFunction,
  stringValue,
  listOf,
  anyValue,
} from "./lib";
import { IResolvable } from "../tokens/resolvable";

/**
 * {@link https://www.terraform.io/docs/language/functions/base64sha256.html base64sha256} computes the SHA256 hash of a given string and encodes it with Base64.
 * @param {string} value
 */
export function base64sha256(value: string | IResolvable) {
  return asString(terraformFunction("base64sha256", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/base64sha512.html base64sha512} computes the SHA512 hash of a given string and encodes it with Base64.
 * @param {string} value
 */
export function base64sha512(value: string | IResolvable) {
  return asString(terraformFunction("base64sha512", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/bcrypt.html bcrypt} computes a hash of the given string using the Blowfish cipher, returning a string in the Modular Crypt Format usually expected in the shadow password file on many Unix systems.
 * @param {string} value
 * @param {number=10} cost
 */
export function bcrypt(
  value: string | IResolvable,
  cost?: number | IResolvable
) {
  return asString(terraformFunction("bcrypt", listOf(anyValue))(value, cost));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/filebase64sha256.html filebase64sha256} is a variant of base64sha256 that hashes the contents of a given file rather than a literal string.
 * @param {string} value
 */
export function filebase64sha256(value: string | IResolvable) {
  return asString(terraformFunction("filebase64sha256", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/filebase64sha512.html filebase64sha512} is a variant of base64sha512 that hashes the contents of a given file rather than a literal string.
 * @param {string} value
 */
export function filebase64sha512(value: string | IResolvable) {
  return asString(terraformFunction("filebase64sha512", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/filemd5.html filemd5} is a variant of md5 that hashes the contents of a given file rather than a literal string.
 * @param {string} value
 */
export function filemd5(value: string | IResolvable) {
  return asString(terraformFunction("filemd5", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/filesha1.html filesha1} is a variant of sha1 that hashes the contents of a given file rather than a literal string.
 * @param {string} value
 */
export function filesha1(value: string | IResolvable) {
  return asString(terraformFunction("filesha1", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/filesha256.html filesha256} is a variant of sha256 that hashes the contents of a given file rather than a literal string.
 * @param {string} value
 */
export function filesha256(value: string | IResolvable) {
  return asString(terraformFunction("filesha256", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/filesha512.html filesha512} is a variant of sha512 that hashes the contents of a given file rather than a literal string.
 * @param {string} value
 */
export function filesha512(value: string | IResolvable) {
  return asString(terraformFunction("filesha512", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/md5.html md5} computes the MD5 hash of a given string and encodes it with hexadecimal digits.
 * @param {string} value
 */
export function md5(value: string | IResolvable) {
  return asString(terraformFunction("md5", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/rsadecrypt.html rsadecrypt} decrypts an RSA-encrypted ciphertext, returning the corresponding cleartext.
 * @param {string} ciphertext
 * @param {string} privatekey
 */
export function rsadecrypt(
  ciphertext: string | IResolvable,
  privatekey: string | IResolvable
) {
  return asString(
    terraformFunction("rsadecrypt", [stringValue, stringValue])(
      ciphertext,
      privatekey
    )
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/sha1.html sha1} computes the SHA1 hash of a given string and encodes it with hexadecimal digits.
 * @param {string} value
 */
export function sha1(value: string | IResolvable) {
  return asString(terraformFunction("sha1", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/sha256.html sha256} computes the SHA256 hash of a given string and encodes it with hexadecimal digits.
 * @param {string} value
 */
export function sha256(value: string | IResolvable) {
  return asString(terraformFunction("sha256", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/sha512.html sha512} computes the SHA512 hash of a given string and encodes it with hexadecimal digits.
 * @param {string} value
 */
export function sha512(value: string | IResolvable) {
  return asString(terraformFunction("sha512", [stringValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/uuid.html uuid} generates a unique identifier string.
 */
export function uuid() {
  return asString(terraformFunction("uuid", [])());
}

/**
 * {@link https://www.terraform.io/docs/language/functions/uuidv5.html uuidv5} generates a unique identifier string.
 * @param {string} namespace
 * @param {string} name
 */
export function uuidv5(
  namespace: string | IResolvable,
  name: string | IResolvable
) {
  return asString(
    terraformFunction("uuidv5", [stringValue, stringValue])(namespace, name)
  );
}
