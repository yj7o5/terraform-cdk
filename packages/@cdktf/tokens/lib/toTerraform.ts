import { CodeMaker } from "codemaker";
import { AttributeModel } from "./types";
import { determineMapType, sanitizeName } from "./utils";

/**
 * Downcase the first character in a string.
 *
 * @param str the string to be processed.
 */
export function downcaseFirst(str: string): string {
  if (str === "") {
    return str;
  }
  return `${str[0].toLocaleLowerCase()}${str.slice(1)}`;
}
export function generateToTerraform(
  code: CodeMaker,
  customDefaults: Record<string, any>,
  att: AttributeModel,
  isStruct: boolean
) {
  const type = att.type;
  const context = isStruct ? "struct!" : "this";
  const name = isStruct ? sanitizeName(att.name) : att.storageName;
  const customDefault = customDefaults[att.terraformFullName];

  const varReference = `${context}.${name}`;
  const defaultCheck =
    customDefault !== undefined
      ? `${varReference} === undefined ? ${customDefault} : `
      : "";

  switch (true) {
    case type.isList && type.isMap:
      code.line(
        `${
          att.terraformName
        }: ${defaultCheck}cdktf.listMapper(cdktf.hashMapper(cdktf.${determineMapType(
          att
        )}ToTerraform))(${varReference}),`
      );
      break;
    case type.isStringList || type.isNumberList || type.isBooleanList:
      code.line(
        `${
          att.terraformName
        }: ${defaultCheck}cdktf.listMapper(cdktf.${downcaseFirst(
          type.innerType
        )}ToTerraform)(${varReference}),`
      );
      break;
    case type.isList:
      code.line(
        `${att.terraformName}: ${defaultCheck}cdktf.listMapper(${downcaseFirst(
          type.innerType
        )}ToTerraform)(${varReference}),`
      );
      break;
    case type.isMap:
      code.line(
        `${
          att.terraformName
        }: ${defaultCheck}cdktf.hashMapper(cdktf.${determineMapType(
          att
        )}ToTerraform)(${varReference}),`
      );
      break;
    case type.isString:
      code.line(
        `${att.terraformName}: ${defaultCheck}cdktf.stringToTerraform(${varReference}),`
      );
      break;
    case type.isNumber:
      code.line(
        `${att.terraformName}: ${defaultCheck}cdktf.numberToTerraform(${varReference}),`
      );
      break;
    case type.isBoolean:
      code.line(
        `${att.terraformName}: ${defaultCheck}cdktf.booleanToTerraform(${varReference}),`
      );
      break;
    default:
      code.line(
        `${att.terraformName}: ${defaultCheck}${downcaseFirst(
          type.name
        )}ToTerraform(${varReference}),`
      );
      break;
  }
}
