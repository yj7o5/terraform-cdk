// TODO: maybe move the entire attribute type model here
export interface AttributeTypeModel {
  innerType: string;
  isBoolean: boolean;
  isBooleanList: boolean;
  isBooleanMap: boolean;
  isComputed: boolean;
  isComplex: boolean;
  isList: boolean;
  isMap: boolean;
  isNumber: boolean;
  isNumberList: boolean;
  isNumberMap: boolean;
  isString: boolean;
  isStringList: boolean;
  isStringMap: boolean;
  name: string;
  level: number;
  complex: boolean;
}

export interface AttributeModel {
  computed: boolean;
  name: string;
  optional: boolean;
  provider: boolean;
  required: boolean;
  storageName: string;
  terraformFullName: string;
  terraformName: string;
  type: AttributeTypeModel;
}
