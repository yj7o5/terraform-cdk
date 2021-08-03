# @cdktf/tokens

The token system delivers static (known to CDKTF) and computed values (known only inside Terraform) to the Constructs defining the infrastructure in a language-native way.
It's cruical to keep the user in the context of their language. A core purpose is to track the origin of values so that we can synthesise correct HCL references.

## Proposed new API

```sh
yarn install @cdktf/tokens
```

```ts
import {
  maskString,
  unmaskString,
  isToken,
  generateAttribute,
} from "@cdktf/tokens";

const terraformStringResult = {
  __type: "object",
  kind: "docker_image",
  name: "the_name",
  selector: ["latest"],
};
const maskedString = maskString(terraformStringResult); // "TOKEN[TOKEN.3]"
const stringReference = unmaskString(maskedString); // docker_image.the_name.latest
const isReference = isToken(maskedString); // true
const lazyMask = lazy(() => ({
  __type: "call",
  function: "concat",
  args: [[terraformStringResult, "a static string"], ["otherStaticString"]],
}));
const lazyCall = unmaskString(maskedString); // concat([docker_image.the_name.latest, "a static string"], ["otherStaticString"])

generateAttribute({ name: "latest", type: "string" }); // attribute definition inside a class as a string
generateToTerraform({ name: "latest", type: "string" }); // attribute definition inside a class as a string
```
