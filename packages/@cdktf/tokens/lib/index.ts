export type Tokenized<T> = T & { __brand: "Tokenized" };
export function isToken<T>(input: any): input is Tokenized<T> {
  return input && input.__brand === "Tokenized";
}
export function asToken<T>(input: any): Tokenized<T> {
  return input;
}

export function mask<T>(input: T): Tokenized<T> {
  return asToken(input);
}
export function unmask<T>(input: Tokenized<T>): T {
  return input;
}
export function generateAttribute() {}
