# @cdktf/tokens

The token system delivers static (known to CDKTF) and computed values (known only inside Terraform) to the Constructs defining the infrastructure in a language-native way.
It's cruical to keep the user in the context of their language. A core purpose is to track the origin of values so that we can synthesise correct HCL references.

## Usage

```sh
yarn install @cdktf/tokens
```
