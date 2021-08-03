import { AttributeModel } from "./types";

export function determineMapType(att: AttributeModel) {
  const type = att.type;
  if (type.isStringMap) {
    return `string`;
  }
  if (type.isNumberMap) {
    return `number`;
  }
  if (type.isBooleanMap) {
    return `boolean`;
  }
  if (process.env.DEBUG) {
    console.error(`The attribute ${JSON.stringify(att)} isn't implemented yet`);
  }
  return `any`;
}

export function sanitizeName(name: string) {
  // `self` and `build` doesn't work in as property name in Python
  if (name === "self" || name === "build") return `${name}Attribute`;
  // jsii can't handle `getFoo` properties, since it's incompatible with Java
  if (name.match(/^get[A-Z]+/)) return name.replace("get", "fetch");
  // `equals` is a prohibited name in jsii
  if (name === "equals") return "equalTo";
  return name;
}
