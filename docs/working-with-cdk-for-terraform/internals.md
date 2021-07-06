# CDK for Terraform internals

From code to HCL – following the data through the codebase

## A simple CDKTF Python stack

```python
from constructs import Construct
from cdktf import App, TerraformStack
from imports.docker import Image, Container, DockerProvider


class MyStack(TerraformStack):
    def __init__(self, scope: Construct, ns: str):
        super().__init__(scope, ns)

        DockerProvider(self, "provider")

        docker_image = Image(self, 'nginx-latest', name='nginx:latest', keep_locally=False)

        Container(self, 'nginx-cdktf', name='nginx-python-cdktf',
                  image=docker_image.name, ports=[
                      {
                          'internal': 80,
                          'external': 8000
                      }], privileged=False)


app = App()
MyStack(app, "python-docker")

app.synth()
```

## Generating bindings for the Terraform Docker provider (`cdktf get`)

`cdktf.json`:

```jsonc
{
  "language": "python",
  "app": "pipenv run python main.py",
  "terraformProviders": [
    // we are going to create bindings for this provider
    "terraform-providers/docker@~> 2.0"
  ],
  "codeMakerOutput": "imports"
}
```

`packages/cdktf-cli/bin/cmds/get.ts` reads `cdktf.json` config and passes the `constraints` (that is used Terraform provider and module versions) to the `Get` React component (using `ink`)

```typescript
const providers = config.terraformProviders ?? [];
const modules = config.terraformModules ?? [];
const { output, language } = args;

const constraints: TerraformDependencyConstraint[] = [...providers, ...modules];
```

`packages/cdktf-cli/bin/cmds/ui/get.tsx` instantiates a `ConstructsMaker` and calls its `.generate()` method.

```typescript
await fs.remove(constructsOptions.codeMakerOutput);
const constructsMaker = new ConstructsMaker(constructsOptions, constraints);
setCurrentStatus(Status.DOWNLOADING);
await constructsMaker.generate();
setCurrentStatus(Status.DONE);
if (!(await fs.pathExists(codeMakerOutput))) {
  console.error(
    `ERROR: synthesis failed, app expected to create "${codeMakerOutput}"`
  );
  process.exit(1);
}
```

### Generating bindings in TypeScript (`constructs-maker` + using `codemaker`)

`.generate()` method starts with:

```typescript
public async generate() {
    await this.generateTypeScript();
    ...
}
```

```typescript
private async generateTypeScript() {
    const schema = await readSchema(this.targets);
    ...
}
```

`packages/cdktf-cli/lib/get/generator/provider-schema.ts`

```typescript
export async function readSchema(targets: ConstructsMakerTarget[]) {
  const config: TerraformConfig = {
    terraform: {},
  };

  for (const target of targets) {
    // put provider/module source and version of targets into config
    ...
  }

  let providerSchema: ProviderSchema = { format_version: "1.0" };
  let moduleSchema: Record<string, ModuleSchema> = {};

  await withTempDir("fetchSchema", async () => {
    const outdir = process.cwd();
    const filePath = path.join(outdir, "main.tf.json");
    await fs.writeFile(filePath, JSON.stringify(config));

    await exec(terraformBinaryName, ["init"], { cwd: outdir });

    // conditional code for generating providers and modules (discussed below)
    …
  });

  return {
    providerSchema,
    moduleSchema,
  };
}
```

#### Getting the schema for Terraform providers

`packages/cdktf-cli/lib/get/generator/provider-schema.ts > readSchema()`

```typescript
if (config.provider) {
  providerSchema = JSON.parse(
    await exec(terraformBinaryName, ["providers", "schema", "-json"], {
      cwd: outdir,
    })
  ) as ProviderSchema;
}
```

// TODO: show part of such a schema json for the Docker provider

#### Getting the schema for Terraform modules

`packages/cdktf-cli/lib/get/generator/provider-schema.ts > readSchema()`

```typescript
if (config.module) {
  moduleSchema = await harvestModuleSchema(outdir, Object.keys(config.module));
}
```

`modules.json` contains a list of modules with a temp directory pointing to the downloaded hcl source code of that module. That code is fed into the `convertFiles` function of the `hcl2json` lib which is also maintained by the CDKTF team (living in our monorepo).  
For each module a json file representing its HCL code is generated and the inputs (Terraform variables) and outputs are extracted from that json and fed into a module schema.

```typescript
const harvestModuleSchema = async (
  workingDirectory: string,
  modules: string[]
): Promise<Record<string, any>> => {
  const fileName = path.join(
    workingDirectory,
    ".terraform",
    "modules",
    "modules.json"
  );
  const result: Record<string, any> = {};

  if (!fs.existsSync(fileName)) {
    throw new Error(
      `Modules were not generated properly - couldn't find ${fileName}`
    );
  }

  const moduleIndex = JSON.parse(
    fs.readFileSync(fileName, "utf-8")
  ) as ModuleIndex;

  for (const mod of modules) {
    const m = moduleIndex.Modules.find((other) => mod === other.Key);

    const parsed = await convertFiles(path.join(workingDirectory, m.Dir));

    const schema: ModuleSchema = {
      inputs: transformVariables(parsed.variable),
      outputs: transformOutputs(parsed.output),
      name: mod,
    };

    result[mod] = schema;
  }

  return result;
};
```

This leads us back to where we dug deeper:

```typescript
private async generateTypeScript() {
    const schema = await readSchema(this.targets);
    ...
}
```

after reading the schemas we can now head over to the code generation

```typescript
if (providerTargets.length > 0) {
  new TerraformProviderGenerator(
    this.code,
    schema.providerSchema,
    providerTargets
  );
}

if (moduleTargets.length > 0) {
  new ModuleGenerator(this.code, moduleTargets);
}
```

Depending on whether we have Terraform providers and/or modules we instantiate a `TerraformProviderGenerator` and/or a `ModuleGenerator`

#### Generating TypeScript code for Terraform providers (`TerraformProviderGenerator`)

`packages/cdktf-cli/lib/get/generator/provider-generator.ts`
uses `codemaker` lib from AWS and has a `emitProvider()` method which is called for each provider.


#### Generating TypeScript code for Terraform modules (`ModuleGenerator`)


### Translating the bindings to Python (using `JSII`)

## Synthesizing a CDKTF Python stack (`cdktf synth`)

## Running Terraform (`cdktf diff` / `cdktf deploy`)
