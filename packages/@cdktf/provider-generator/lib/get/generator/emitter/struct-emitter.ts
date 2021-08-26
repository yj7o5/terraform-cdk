import { CodeMaker } from "codemaker";
import { ResourceModel, Struct, ConfigStruct } from "../models";
import { AttributesEmitter } from "./attributes-emitter";
import { downcaseFirst } from "../../../util";

export class StructEmitter {
  attributesEmitter: AttributesEmitter;

  constructor(private readonly code: CodeMaker) {
    this.attributesEmitter = new AttributesEmitter(this.code);
  }

  public emit(resource: ResourceModel) {
    resource.structs.forEach((struct) => {
      if (struct.isSingleItem) {
        this.emitInterface(resource, struct, `I${struct.name}`);
        this.emitClass(struct);
      } else if (struct.isClass) {
        this.emitClass(struct);
      } else {
        this.emitInterface(resource, struct);
      }
    });
  }

  private emitInterface(
    resource: ResourceModel,
    struct: Struct,
    name = struct.name
  ) {
    if (resource.isProvider) {
      this.code.openBlock(`export interface ${name}`);
    } else {
      this.code.openBlock(`export interface ${name}${struct.extends}`);
    }

    for (const att of struct.assignableAttributes) {
      if (att.description) {
        this.code.line(`/**`);
        this.code.line(`* ${att.description}`);
        this.code.line(`* `);
        this.code.line(
          `* Docs at Terraform Registry: {@link ${resource.linkToDocs}#${att.terraformName} ${resource.className}#${att.terraformName}}`
        );
        this.code.line(`*/`);
      } else {
        this.code.line(`/**`);
        this.code.line(
          `* Docs at Terraform Registry: {@link ${resource.linkToDocs}#${att.terraformName} ${resource.className}#${att.terraformName}}`
        );
        this.code.line(`*/`);
      }

      this.code.line(`readonly ${att.typeDefinition};`);
    }
    this.code.closeBlock();

    if (!(struct instanceof ConfigStruct)) {
      this.emitToTerraformFunction(struct);
    }
  }

  private emitClass(struct: Struct) {
    this.code.openBlock(
      `export class ${struct.name} ${
        struct.isSingleItem
          ? "extends cdktf.ComplexObject"
          : "extends cdktf.ComplexComputedList"
      }`
    );

    if (struct.isSingleItem) {
      this.code.line(`/**`);
      this.code.line(`* @param options ${struct.attributeType}`);
      this.code.line(`*/`);
      this.code.openBlock(
        `public constructor(terraformResource: cdktf.ITerraformResource, terraformAttribute: string ${
          struct.assignableAttributes.length > 0
            ? `, config: I${struct.attributeType}`
            : ""
        })`
      );
      this.code.line(`super(terraformResource, terraformAttribute);`);
      for (const att of struct.assignableAttributes) {
        this.code.line(`this.${att.storageName} = config.${att.name};`);
      }
      this.code.closeBlock();
    }

    for (const att of struct.attributes) {
      this.attributesEmitter.emit(
        att,
        this.attributesEmitter.needsResetEscape(att, struct.attributes),
        this.attributesEmitter.needsInputEscape(att, struct.attributes)
      );
    }
    this.code.closeBlock();
  }

  private emitToTerraformFunction(struct: Struct) {
    this.code.line();
    this.code.openBlock(
      `function ${downcaseFirst(struct.name)}ToTerraform(struct?: ${
        struct.isSingleItem ? "I" : ""
      }${struct.name}): any`
    );
    this.code.line(`if (!cdktf.canInspect(struct)) { return struct; }`);
    this.code.openBlock("return");
    for (const att of struct.isClass
      ? struct.attributes
      : struct.assignableAttributes) {
      if (!att.isConfigIgnored) {
        this.attributesEmitter.emitToTerraform(att, true);
      }
    }
    this.code.closeBlock(";");
    this.code.closeBlock();
    this.code.line();
  }
}
