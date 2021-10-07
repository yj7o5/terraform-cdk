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
      this.emitInterface(resource, struct, `I${struct.name}`);
      this.emitClass(struct);
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
      `export class ${struct.name} extends cdktf.ComplexObject`
    );

    this.code.line(`/**`);
    this.code.line(`* @param terraformResource: Parent Terraform Resource`);
    this.code.line(
      `* @param terraformAttribute: Name of the attribute this value is used in`
    );
    this.code.line(
      `* @param isSingleItem: If this element is of a single item block type (max_items = 1)`
    );
    this.code.line(`*/`);
    this.code.openBlock(
      `public constructor(terraformResource: cdktf.ITerraformResource, terraformAttribute: string, isSingleItem: boolean)`
    );
    this.code.line(
      `super(terraformResource, terraformAttribute, isSingleItem);`
    );
    this.code.closeBlock();
    this.code.line(`public withinArray = false;`);

    for (const att of struct.attributes) {
      this.attributesEmitter.emit(
        att,
        this.attributesEmitter.needsResetEscape(att, struct.attributes),
        this.attributesEmitter.needsInputEscape(att, struct.attributes)
      );
    }

    // We want to be able to create a list of this type out of an instance
    // of this type.
    this.code.openBlock(`public asList(): ${struct.name}[]`);
    this.code.line(`this.withinArray = true;`);
    this.code.line(`return [this];`);
    this.code.closeBlock();

    this.code.closeBlock();
  }

  private emitToTerraformFunction(struct: Struct) {
    this.code.line();
    // TODO: remove export and only generate conditionally
    this.code.openBlock(
      `export function ${downcaseFirst(struct.name)}ToTerraform(struct?: ${
        struct.isSingleItem || struct.isClass ? `${struct.name} | I` : ""
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
