import { AttributeModel } from "./types";
import { sanitizeName } from "./utils";

// export type Tokenized<T> = T & { __brand: "Tokenized" };
// export function isToken<T>(input: any): input is Tokenized<T> {
//   return input && input.__brand === "Tokenized";
// }
// export function asToken<T>(input: any): Tokenized<T> {
//   return input;
// }

// export function mask<T>(input: T): Tokenized<T> {
//   return asToken(input);
// }
// export function unmask<T>(input: Tokenized<T>): T {
//   return input;
// }

export * from "./tokens";
export * from "./_tokens";
export * from "./toTerraform";
export * from "./generateAttribute";

// function foo(){
//     const type = att.type;
//   if (type.isString) {
//     return `this.getStringAttribute('${att.terraformName}')`;
//   }
//   if (type.isStringList) {
//     return `this.getListAttribute('${att.terraformName}')`;
//   }
//   if (type.isNumber) {
//     return `this.getNumberAttribute('${att.terraformName}')`;
//   }
//   if (type.isBoolean) {
//     return `this.getBooleanAttribute('${att.terraformName}')`;
//   }
//   if (process.env.DEBUG) {
//     console.error(`The attribute ${JSON.stringify(att)} isn't implemented yet`);
//   }
//   return `this.interpolationForAttribute('${att.terraformName}') as any`;
// }

export function generateAttributeType(att: AttributeModel): string {
  const optional = att.optional ? "?" : "";
  return `${sanitizeName(att.name)}${optional}: ${att.type.name}`;
}
