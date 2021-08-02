# @cdktf/tokens

The token system delivers static (known to CDKTF) and computed values (known only inside Terraform) to the Constructs defining the infrastructure in a language-native way.
It's cruical to keep the user in the context of their language. A core purpose is to track the origin of values so that we can synthesise correct HCL references.

## Usage

```sh
yarn install @cdktf/tokens
```

```ts
import { mask, unmask, isToken, generateAttribute } from "@cdktf/tokens";

// e.g. within the scope of a docker.Image
const maskedString = mask("a string"); // "TOKEN[TOKEN.3]"
const stringReference = unmask(maskedString); // docker_image.the_name.latest
const isReference = isToken(maskedString); // true
const lazyMask = lazy(() => "a lazy string");

generateAttribute({ name: "latest", type: "string" }); // attribute definition inside a class as a string
```
