import {
  asBoolean,
  terraformFunction,
  listOf,
  anyValue,
  numericValue,
  asList,
  asAny,
  asNumber,
  mapValue,
} from "./lib";
import { IResolvable } from "../tokens/resolvable";

/**
 * {@link https://www.terraform.io/docs/language/functions/anytrue.html anytrue} returns true if all elements in a given collection are true or "true"
 * @param {Array} values
 */
export function alltrue(values: any[]) {
  return asBoolean(terraformFunction("alltrue", [listOf(anyValue)])(values));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/anytrue.html anytrue} returns true if any element in a given collection is true or "true"
 * @param {Array} value
 */
export function anytrue(value: any[]) {
  return asBoolean(terraformFunction("anytrue", [listOf(anyValue)])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/chunklist.html chunklist} splits a single list into fixed-size chunks, returning a list of lists.
 * @param {Array} value
 * @param {number} chunkSize
 */
export function chunklist(value: any[], chunkSize: number | IResolvable) {
  return asList(
    terraformFunction("chunklist", [listOf(anyValue), numericValue])(
      value,
      chunkSize
    )
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/coalesce.html coalesce} takes any number of arguments and returns the first one that isn't null or an empty string.
 * @param {Array} value - Arguments are passed in an array
 */
export function coalesce(value: any[]) {
  return terraformFunction("coalesce", listOf(anyValue))(...value);
}

/**
 * {@link https://www.terraform.io/docs/language/functions/coalescelist.html coalescelist} takes any number of list arguments and returns the first one that isn't empty.
 * @param Array} value - Arguments are passed in an array
 */
export function coalescelist(value: any[][]) {
  return asList(terraformFunction("coalescelist", listOf(anyValue))(...value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/compact.html compact} takes a list of strings and returns a new list with any empty string elements removed.
 * @param {Array} value
 */
export function compact(value: string[]) {
  return asList(terraformFunction("compact", [listOf(anyValue)])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/concat.html concat} takes two or more lists and combines them into a single list.
 * @param {Array} value
 */
export function concat(value: any[][]) {
  return asList(terraformFunction("concat", listOf(anyValue))(...value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/contains.html contains} determines whether a given list or set contains a given single value as one of its elements.
 * @param {Array} list
 * @param {any} value
 */
export function contains(list: any[], value: any) {
  return asBoolean(
    terraformFunction("contains", [listOf(anyValue), anyValue])(list, value)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/distinct.html distinct} takes a list and returns a new list with any duplicate elements removed.
 * @param {Array} list
 */
export function distinct(list: any[]) {
  return asList(terraformFunction("distinct", [listOf(anyValue)])(list));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/element.html element} retrieves a single element from a list.
 * @param {Array} list
 * @param {number} index
 */
export function element(
  list: any[] | string | IResolvable,
  index: number | IResolvable
) {
  return asAny(
    terraformFunction("element", [listOf(anyValue), numericValue])(list, index)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/flatten.html flatten} takes a list and replaces any elements that are lists with a flattened sequence of the list contents.
 * @param {Array} list
 */
export function flatten(list: any[] | string) {
  return asList(terraformFunction("flatten", [listOf(anyValue)])(list));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/index.html index} finds the element index for a given value in a list.
 * @param {Array} list
 * @param {any} value
 */
export function index(list: any[] | string, value: any) {
  return asNumber(
    terraformFunction("index", [listOf(anyValue), anyValue])(list, value)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/keys.html keys} takes a map and returns a list containing the keys from that map.
 * @param {Object} map
 */
export function keys(map: any) {
  return asList(terraformFunction("keys", [mapValue])(map));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/length.html length} determines the length of a given list, map, or string.
 * @param {Object|Array|string} value
 */
export function lengthOf(value: any) {
  return asNumber(terraformFunction("length", [anyValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/matchkeys.html lookup} retrieves the value of a single element from a map, given its key. If the given key does not exist, the given default value is returned instead.
 * @param {Object} value
 * @param {any} key
 * @param {any} defaultValue
 */
export function lookup(value: any, key: any, defaultValue: any) {
  return asAny(
    terraformFunction("lookup", [anyValue, anyValue, anyValue])(
      value,
      key,
      defaultValue
    )
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/matchkeys.html matchkeys} constructs a new list by taking a subset of elements from one list whose indexes match the corresponding indexes of values in another list.
 * @param {Array} valuesList
 * @param {Array} keysList
 * @param {Array} searchSet
 */
export function matchkeys(
  valuesList: any[] | string,
  keysList: any[] | string,
  searchSet: any[] | string
) {
  return asList(
    terraformFunction("matchkeys", [anyValue, anyValue, anyValue])(
      valuesList,
      keysList,
      searchSet
    )
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/merge.html merge} takes an arbitrary number of maps or objects, and returns a single map or object that contains a merged set of elements from all arguments.
 * @param {Array)} values - Arguments are passed in an array
 */
export function merge(values: any[]) {
  return asList(terraformFunction("merge", listOf(anyValue))(...values));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/one.html one} takes a list, set, or tuple value with either zero or one elements.
 * @param {Array} list
 */
export function one(list: any[] | string) {
  return asAny(terraformFunction("one", [listOf(anyValue)])(list));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/range.html range} generates a list of numbers using a start value, a limit value, and a step value.
 * @param {number} start
 * @param {number} limit
 * @param {number=1} step
 */
export function range(
  start: number | IResolvable,
  limit: number | IResolvable,
  step = 1
) {
  return asList(
    terraformFunction("range", listOf(anyValue))(start, limit, step)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/reverse.html reverse} takes a sequence and produces a new sequence of the same length with all of the same elements as the given sequence but in reverse order.
 * @param {Array} values
 */
export function reverse(values: any[]) {
  return asList(terraformFunction("reverse", [listOf(anyValue)])(values));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/setintersection.html setintersection} function takes multiple sets and produces a single set containing only the elements that all of the given sets have in common
 * @param {Array} values
 */
export function setintersection(values: any[]) {
  return asList(
    terraformFunction("setintersection", listOf(anyValue))(...values)
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/setproduct.html setproduct} function finds all of the possible combinations of elements from all of the given sets by computing the Cartesian product.
 * @param {Array} values
 */
export function setproduct(values: any[]) {
  return asList(terraformFunction("setproduct", listOf(anyValue))(...values));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/slice.html setsubtract} function returns a new set containing the elements from the first set that are not present in the second set.
 * @param {Array} minuend
 * @param {Array} subtrahend
 */
export function setsubtract(
  minuend: any[] | string,
  subtrahend: any[] | string
) {
  return asList(
    terraformFunction("setsubtract", [listOf(anyValue), listOf(anyValue)])(
      minuend,
      subtrahend
    )
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/setunion.html setunion} function takes multiple sets and produces a single set containing the elements from all of the given sets.
 * @param {Array} values - Arguments are passed in an array
 */
export function setunion(values: any[]) {
  return asList(terraformFunction("setunion", listOf(anyValue))(...values));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/slice.html slice} extracts some consecutive elements from within a list.
 * @param {Array} list
 * @param {number} startindex
 * @param {number} endindex
 */
export function slice(
  list: any[] | string,
  startindex: number | IResolvable,
  endindex: number | IResolvable
) {
  return asList(
    terraformFunction("slice", [listOf(anyValue), numericValue, numericValue])(
      list,
      startindex,
      endindex
    )
  );
}

/**
 * {@link https://www.terraform.io/docs/language/functions/sort.html sort} takes a list of strings and returns a new list with those strings sorted lexicographically.
 * @param {Array} list
 */
export function sort(list: any[] | string) {
  return asList(terraformFunction("sort", [listOf(anyValue)])(list));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/sum.html sum} takes a list or set of numbers and returns the sum of those numbers.
 * @param {Array} list
 */
export function sum(list: any[] | string) {
  return asNumber(terraformFunction("sum", [listOf(anyValue)])(list));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/transpose.html transpose} takes a map of lists of strings and swaps the keys and values to produce a new map of lists of strings.
 * @param {Object} value
 */
export function transpose(value: any) {
  return asAny(terraformFunction("transpose", [mapValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/values.html values} takes a map and returns a list containing the values of the elements in that map.
 * @param {Object} value
 */
export function values(value: any) {
  return asList(terraformFunction("values", [mapValue])(value));
}

/**
 * {@link https://www.terraform.io/docs/language/functions/zipmap.html zipmap} constructs a map from a list of keys and a corresponding list of values.
 * @param {Array} keyslist
 * @param {Array} valueslist
 */
export function zipmap(keyslist: any[], valueslist: any[]) {
  return asAny(terraformFunction("zipmap", [mapValue])(keyslist, valueslist));
}
