import { asString, terraformFunction, stringValue } from "./lib";
import { IResolvable } from "../tokens/resolvable";

/**
 * {@link https://www.terraform.io/docs/language/functions/formatdate.html formatdate} converts a timestamp into a different time format.
 * @param {string} spec
 * @param {string} timestamp
 */
export function formatdate(
  spec: string | IResolvable,
  timestamp: string | IResolvable
) {
  return asString(
    terraformFunction("formatdate", [stringValue, stringValue])(spec, timestamp)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/timeadd.html timeadd} adds a duration to a timestamp, returning a new timestamp.
 * @param {string} timestamp
 * @param {string} duration
 */
export function timeadd(
  timestamp: string | IResolvable,
  duration: string | IResolvable
) {
  return asString(
    terraformFunction("timeadd", [stringValue, stringValue])(
      timestamp,
      duration
    )
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/timestamp.html timestamp} returns a UTC timestamp string in RFC 3339 format.
 */
export function timestamp() {
  return asString(terraformFunction("timestamp", [])());
}
