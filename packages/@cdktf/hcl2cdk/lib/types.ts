export type TerraformResourceBlock = unknown;
export type Scope = {
  constructs: Set<string>;
  variables: Record<string, { resource: string; variableName: string }>;
  modules: Set<string>;
};
