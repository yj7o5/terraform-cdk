import { CodeMaker } from "codemaker";
import { AttributeModel, AttributeTypeModel } from "./types";
import { determineMapType, sanitizeName } from "./utils";

function isRootType(att: AttributeTypeModel) {
  return att.level === 2;
}
function isComputedComplex(att: AttributeTypeModel): boolean {
  return isRootType(att) && att.isComputed && att.complex;
}

function needsResetEscape(
  att: AttributeModel,
  attributes: AttributeModel[]
): boolean {
  return (
    attributes.find((a) =>
      a.terraformName.match(`^reset_${att.terraformName}$`)
    ) !== undefined
  );
}

function needsInputEscape(
  att: AttributeModel,
  attributes: AttributeModel[]
): boolean {
  return (
    attributes.find((a) =>
      a.terraformName.match(`^${att.terraformName}_input$`)
    ) !== undefined
  );
}

function isAssignable(att: AttributeModel) {
  return att.required || att.optional;
}
function isConfigIgnored(att: AttributeModel) {
  if (isAssignable(att) && !att.computed) {
    return false;
  }
  const ignoreList = ["arn", "id"];
  return ignoreList.includes(sanitizeName(att.name));
}
export function generateAttribute(
  code: CodeMaker,
  attributes: AttributeModel[],
  att: AttributeModel
) {
  code.line();
  code.line(
    `// ${att.terraformName} - computed: ${att.computed}, optional: ${att.optional}, required: ${att.required}`
  );

  const escapeReset = needsResetEscape(att, attributes);
  const escapeInput = needsInputEscape(att, attributes);

  switch (true) {
    case att.computed &&
      !att.optional &&
      isComputedComplex(att.type) &&
      att.type.isList &&
      att.type.isMap:
      return emitComputedComplexListMap(code, att);
    case att.computed &&
      !att.optional &&
      isComputedComplex(att.type) &&
      att.type.isList:
      return emitComputedComplexList(code, att);
    case att.computed &&
      att.optional &&
      isComputedComplex(att.type) &&
      att.type.isList:
      return emitComputedComplexOptional(code, att, escapeReset, escapeInput);
    case att.computed &&
      !att.optional &&
      isComputedComplex(att.type) &&
      att.type.isMap:
      return emitComputedComplexMap(code, att);
    case att.computed &&
      att.optional &&
      isComputedComplex(att.type) &&
      att.type.isMap:
      return emitComputedComplexOptional(code, att, escapeReset, escapeInput);
    case att.computed && att.optional && !att.required && isConfigIgnored(att):
      return emitOptionalComputedIgnored(code, att);
    case att.computed && att.optional:
      return emitOptionalComputed(code, att, escapeReset, escapeInput);
    case att.computed:
      return emitComputed(code, att);
    case att.optional:
      return emitOptional(code, att, escapeReset, escapeInput);
    case att.required:
      return emitRequired(code, att, escapeInput);
  }
}

function emitComputedComplexListMap(code: CodeMaker, att: AttributeModel) {
  code.openBlock(
    `public ${sanitizeName(
      att.name
    )}(index: string, key: string): ${determineMapType(att)}`
  );
  code.line(
    `return new ${att.type.name}(this, \`${att.terraformName}.\${index}\`).lookup(key);`
  );
  code.closeBlock();
}

function determineGetAttCall(att: AttributeModel) {
  const type = att.type;
  if (type.isString) {
    return `this.getStringAttribute('${att.terraformName}')`;
  }
  if (type.isStringList) {
    return `this.getListAttribute('${att.terraformName}')`;
  }
  if (type.isNumber) {
    return `this.getNumberAttribute('${att.terraformName}')`;
  }
  if (type.isBoolean) {
    return `this.getBooleanAttribute('${att.terraformName}')`;
  }
  if (process.env.DEBUG) {
    console.error(`The attribute ${JSON.stringify(att)} isn't implemented yet`);
  }
  return `this.interpolationForAttribute('${att.terraformName}') as any`;
}

function getResetName(name: string, escape: boolean) {
  if (!name) return name;
  if (escape) {
    return `resetTf${name[0].toUpperCase() + name.slice(1)}`;
  } else {
    return `reset${name[0].toUpperCase() + name.slice(1)}`;
  }
}

function getInputName(att: AttributeModel, escape: boolean) {
  if (escape) {
    return `${sanitizeName(att.name)}TfInput`;
  } else {
    return `${sanitizeName(att.name)}Input`;
  }
}

function emitOptional(
  code: CodeMaker,
  att: AttributeModel,
  escapeReset: boolean,
  escapeInput: boolean
) {
  code.line(`private ${att.storageName}?: ${att.type.name};`);
  code.openBlock(`public get ${sanitizeName(att.name)}()`);
  code.line(
    `return ${
      att.provider ? "this." + att.storageName : determineGetAttCall(att)
    };`
  );
  code.closeBlock();

  code.openBlock(
    `public set ${sanitizeName(att.name)}(value: ${att.type.name} ${
      att.provider ? " | undefined" : ""
    })`
  );
  code.line(`this.${att.storageName} = value;`);
  code.closeBlock();

  code.openBlock(
    `public ${getResetName(sanitizeName(att.name), escapeReset)}()`
  );
  code.line(`this.${att.storageName} = undefined;`);
  code.closeBlock();

  code.line(`// Temporarily expose input value. Use with caution.`);
  code.openBlock(`public get ${getInputName(att, escapeInput)}()`);
  code.line(`return this.${att.storageName}`);
  code.closeBlock();
}

function emitOptionalComputed(
  code: CodeMaker,
  att: AttributeModel,
  escapeReset: boolean,
  escapeInput: boolean
) {
  code.line(`private ${att.storageName}?: ${att.type.name};`);
  code.openBlock(`public get ${sanitizeName(att.name)}()`);
  code.line(`return ${determineGetAttCall(att)};`);
  code.closeBlock();

  code.openBlock(
    `public set ${sanitizeName(att.name)}(value: ${att.type.name})`
  );
  code.line(`this.${att.storageName} = value;`);
  code.closeBlock();

  code.openBlock(
    `public ${getResetName(sanitizeName(att.name), escapeReset)}()`
  );
  code.line(`this.${att.storageName} = undefined;`);
  code.closeBlock();

  code.line(`// Temporarily expose input value. Use with caution.`);
  code.openBlock(`public get ${getInputName(att, escapeInput)}()`);
  code.line(`return this.${att.storageName}`);
  code.closeBlock();
}

function emitOptionalComputedIgnored(code: CodeMaker, att: AttributeModel) {
  code.openBlock(`public get ${sanitizeName(att.name)}()`);
  code.line(`return ${determineGetAttCall(att)};`);
  code.closeBlock();
}

function emitComputed(code: CodeMaker, att: AttributeModel) {
  code.openBlock(`public get ${sanitizeName(att.name)}()`);
  code.line(`return ${determineGetAttCall(att)};`);
  code.closeBlock();
}

function emitRequired(
  code: CodeMaker,
  att: AttributeModel,
  escapeInput: boolean
) {
  code.line(`private ${att.storageName}: ${att.type.name};`);
  code.openBlock(`public get ${sanitizeName(att.name)}()`);
  code.line(
    `return ${
      att.provider ? "this." + att.storageName : determineGetAttCall(att)
    };`
  );
  code.closeBlock();

  code.openBlock(
    `public set ${sanitizeName(att.name)}(value: ${att.type.name})`
  );
  code.line(`this.${att.storageName} = value;`);
  code.closeBlock();

  code.line(`// Temporarily expose input value. Use with caution.`);
  code.openBlock(`public get ${getInputName(att, escapeInput)}()`);
  code.line(`return this.${att.storageName}`);
  code.closeBlock();
}

function emitComputedComplexList(code: CodeMaker, att: AttributeModel) {
  code.openBlock(`public ${sanitizeName(att.name)}(index: string)`);
  code.line(
    `return new ${att.type.name}(this, '${att.terraformName}', index);`
  );
  code.closeBlock();
}

function emitComputedComplexOptional(
  code: CodeMaker,
  att: AttributeModel,
  escapeReset: boolean,
  escapeInput: boolean
) {
  code.line(`private ${att.storageName}?: ${att.type.name}`);
  code.openBlock(`public get ${sanitizeName(att.name)}(): ${att.type.name}`);
  code.line(
    `return this.interpolationForAttribute('${att.terraformName}') as any; // Getting the computed value is not yet implemented`
  );
  code.closeBlock();

  code.openBlock(
    `public set ${sanitizeName(att.name)}(value: ${att.type.name})`
  );
  code.line(`this.${att.storageName} = value;`);
  code.closeBlock();

  code.openBlock(
    `public ${getResetName(sanitizeName(att.name), escapeReset)}()`
  );
  code.line(`this.${att.storageName} = undefined;`);
  code.closeBlock();

  code.line(`// Temporarily expose input value. Use with caution.`);
  code.openBlock(`public get ${getInputName(att, escapeInput)}()`);
  code.line(`return this.${att.storageName}`);
  code.closeBlock();
}

function emitComputedComplexMap(code: CodeMaker, att: AttributeModel) {
  code.openBlock(
    `public ${sanitizeName(att.name)}(key: string): ${determineMapType(att)}`
  );
  code.line(
    `return new ${att.type.name}(this, '${att.terraformName}').lookup(key);`
  );
  code.closeBlock();
}
