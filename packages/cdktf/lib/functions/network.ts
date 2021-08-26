import {
  asString,
  terraformFunction,
  stringValue,
  numericValue,
  asList,
  listOf,
  anyValue,
} from "./lib";
import { IResolvable } from "../tokens/resolvable";

/**
 * {@link https://www.terraform.io/docs/language/functions/cidrhost.html cidrhost} calculates a full host IP address for a given host number within a given IP network address prefix.
 * @param {string} prefix
 * @param {number} hostnum
 */
export function cidrhost(
  prefix: string | IResolvable,
  hostnum: number | IResolvable
) {
  return asString(
    terraformFunction("cidrhost", [stringValue, numericValue])(prefix, hostnum)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/cidrnetmask.html cidrnetmask} converts an IPv4 address prefix given in CIDR notation into a subnet mask address.
 * @param {string} prefix
 */
export function cidrnetmask(prefix: string | IResolvable) {
  return asString(terraformFunction("cidrnetmask", [stringValue])(prefix));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/cidrsubnet.html cidrsubnet} calculates a subnet address within given IP network address prefix.
 * @param {string} prefix
 * @param {number} newbits
 * @param {number} netnum
 */
export function cidrsubnet(
  prefix: string | IResolvable,
  newbits: number | IResolvable,
  netnum: number | IResolvable
) {
  return asString(
    terraformFunction("cidrsubnet", [stringValue, numericValue, numericValue])(
      prefix,
      newbits,
      netnum
    )
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/cidrsubnets.html cidrsubnets} calculates a sequence of consecutive IP address ranges within a particular CIDR prefix.
 * @param {string} prefix
 * @param {...number} newbits
 */
export function cidrsubnets(
  prefix: string | IResolvable,
  newbits: (number | IResolvable)[]
) {
  return asList(
    terraformFunction("cidrsubnets", listOf(anyValue))(prefix, ...newbits)
  );
}
