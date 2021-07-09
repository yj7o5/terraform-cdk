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

`emitProvider` loops over all resource schemas, data source schemas and emits files for their representation in TypeScript

```typescript
private emitProvider(fqpn: string, provider: Provider) {
    const files: string[] = [];
    for (const [type, resource] of Object.entries(
      provider.resource_schemas || []
    )) {
      files.push(
        this.emitResourceFile(
          this.resourceParser.parse(name, type, resource, "resource")
        )
      );
    }

    for (const [type, resource] of Object.entries(
      provider.data_source_schemas || []
    )) {
      files.push(
        this.emitResourceFile(
          this.resourceParser.parse(
            name,
            `data_${type}`,
            resource,
            "data_source"
          )
        )
      );
    }

    if (provider.provider) {
      const providerResource = this.resourceParser.parse(
        name,
        `provider`,
        provider.provider,
        "provider"
      );
      if (this.providerConstraints) {
        const constraint = this.providerConstraints.find((p) =>
          isMatching(p, fqpn)
        );
        if (!constraint) {
          throw new Error(`can't handle ${fqpn}`);
        }
        providerResource.providerVersionConstraint = constraint.version;
        providerResource.terraformProviderSource = constraint.source;
      }
      files.push(this.emitResourceFile(providerResource));
    }

    this.emitIndexFile(name, files);
  }
```

In the end we get we (optionally) create another TypeScript file for the provider of the provider (which can be used to set config like access keys or the region used for all created resources). Finally we also create an index.ts file which re-exports all created files and offers an entrypoint (also used with JSII).
The code for the Docker Image Construct looks like this:

```ts
// https://www.terraform.io/docs/providers/docker/r/image.html
// generated from terraform resource schema

import { Construct } from "constructs";
import * as cdktf from "cdktf";

// Configuration

export interface ImageConfig extends cdktf.TerraformMetaArguments {
  readonly keepLocally?: boolean;
  readonly name: string;
  readonly pullTrigger?: string;
  readonly pullTriggers?: string[];
}

// Resource

export class Image extends cdktf.TerraformResource {
  // ===========
  // INITIALIZER
  // ===========

  public constructor(scope: Construct, id: string, config: ImageConfig) {
    super(scope, id, {
      terraformResourceType: "docker_image",
      terraformGeneratorMetadata: {
        providerName: "docker",
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
    });
    this._keepLocally = config.keepLocally;
    this._name = config.name;
    this._pullTrigger = config.pullTrigger;
    this._pullTriggers = config.pullTriggers;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // id - computed: true, optional: true, required: false
  public get id() {
    return this.getStringAttribute("id");
  }

  // keep_locally - computed: false, optional: true, required: false
  private _keepLocally?: boolean;
  public get keepLocally() {
    return this.getBooleanAttribute("keep_locally");
  }
  public set keepLocally(value: boolean) {
    this._keepLocally = value;
  }
  public resetKeepLocally() {
    this._keepLocally = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get keepLocallyInput() {
    return this._keepLocally;
  }

  // latest - computed: true, optional: false, required: false
  public get latest() {
    return this.getStringAttribute("latest");
  }

  // name - computed: false, optional: false, required: true
  private _name: string;
  public get name() {
    return this.getStringAttribute("name");
  }
  public set name(value: string) {
    this._name = value;
  }
  // Temporarily expose input value. Use with caution.
  public get nameInput() {
    return this._name;
  }

  // pull_trigger - computed: false, optional: true, required: false
  private _pullTrigger?: string;
  public get pullTrigger() {
    return this.getStringAttribute("pull_trigger");
  }
  public set pullTrigger(value: string) {
    this._pullTrigger = value;
  }
  public resetPullTrigger() {
    this._pullTrigger = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get pullTriggerInput() {
    return this._pullTrigger;
  }

  // pull_triggers - computed: false, optional: true, required: false
  private _pullTriggers?: string[];
  public get pullTriggers() {
    return this.getListAttribute("pull_triggers");
  }
  public set pullTriggers(value: string[]) {
    this._pullTriggers = value;
  }
  public resetPullTriggers() {
    this._pullTriggers = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get pullTriggersInput() {
    return this._pullTriggers;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      keep_locally: cdktf.booleanToTerraform(this._keepLocally),
      name: cdktf.stringToTerraform(this._name),
      pull_trigger: cdktf.stringToTerraform(this._pullTrigger),
      pull_triggers: cdktf.listMapper(cdktf.stringToTerraform)(
        this._pullTriggers
      ),
    };
  }
}
```

#### Generating TypeScript code for Terraform modules (`ModuleGenerator`)

### Translating the bindings to Python (using `JSII`)

Terraform CDK relies on [JSII](https://aws.github.io/jsii/) for cross-language support.
JSII generates wrapper code that exposes an interface for the target programming language to use. At runtime this code communicates with a Node.js process that runs the actual application.
In the context of the CDK this means building a tree of constructs, we will discuss this in the next paragraph.
Taking the above example of a Docker Image resource, JSII produces these Python bindings:

```py
class Image(
    cdktf.TerraformResource,
    metaclass=jsii.JSIIMeta,
    jsii_type="terraform-providers_docker.Image",
):
    '''Represents a {@link https://www.terraform.io/docs/providers/docker/r/image.html docker_image}.'''

    def __init__(
        self,
        scope: constructs.Construct,
        id: builtins.str,
        *,
        name: builtins.str,
        keep_locally: typing.Optional[builtins.bool] = None,
        pull_trigger: typing.Optional[builtins.str] = None,
        pull_triggers: typing.Optional[typing.Sequence[builtins.str]] = None,
        count: typing.Optional[jsii.Number] = None,
        depends_on: typing.Optional[typing.Sequence[cdktf.ITerraformDependable]] = None,
        lifecycle: typing.Optional[cdktf.TerraformResourceLifecycle] = None,
        provider: typing.Optional[cdktf.TerraformProvider] = None,
    ) -> None:
        '''Create a new {@link https://www.terraform.io/docs/providers/docker/r/image.html docker_image} Resource.

        :param scope: The scope in which to define this construct.
        :param id: The scoped construct ID. Must be unique amongst siblings in the same scope
        :param name: Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/docker/r/image.html#name Image#name}.
        :param keep_locally: Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/docker/r/image.html#keep_locally Image#keep_locally}.
        :param pull_trigger: Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/docker/r/image.html#pull_trigger Image#pull_trigger}.
        :param pull_triggers: Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/docker/r/image.html#pull_triggers Image#pull_triggers}.
        :param count:
        :param depends_on:
        :param lifecycle:
        :param provider:
        '''
        config = ImageConfig(
            name=name,
            keep_locally=keep_locally,
            pull_trigger=pull_trigger,
            pull_triggers=pull_triggers,
            count=count,
            depends_on=depends_on,
            lifecycle=lifecycle,
            provider=provider,
        )

        jsii.create(Image, self, [scope, id, config])

    @jsii.member(jsii_name="resetKeepLocally")
    def reset_keep_locally(self) -> None:
        return typing.cast(None, jsii.invoke(self, "resetKeepLocally", []))

    @jsii.member(jsii_name="resetPullTrigger")
    def reset_pull_trigger(self) -> None:
        return typing.cast(None, jsii.invoke(self, "resetPullTrigger", []))

    @jsii.member(jsii_name="resetPullTriggers")
    def reset_pull_triggers(self) -> None:
        return typing.cast(None, jsii.invoke(self, "resetPullTriggers", []))

    @jsii.member(jsii_name="synthesizeAttributes")
    def _synthesize_attributes(self) -> typing.Mapping[builtins.str, typing.Any]:
        return typing.cast(typing.Mapping[builtins.str, typing.Any], jsii.invoke(self, "synthesizeAttributes", []))

    @builtins.property # type: ignore[misc]
    @jsii.member(jsii_name="id")
    def id(self) -> builtins.str:
        return typing.cast(builtins.str, jsii.get(self, "id"))

    @builtins.property # type: ignore[misc]
    @jsii.member(jsii_name="latest")
    def latest(self) -> builtins.str:
        return typing.cast(builtins.str, jsii.get(self, "latest"))

    @builtins.property # type: ignore[misc]
    @jsii.member(jsii_name="nameInput")
    def name_input(self) -> builtins.str:
        return typing.cast(builtins.str, jsii.get(self, "nameInput"))

    @builtins.property # type: ignore[misc]
    @jsii.member(jsii_name="keepLocallyInput")
    def keep_locally_input(self) -> typing.Optional[builtins.bool]:
        return typing.cast(typing.Optional[builtins.bool], jsii.get(self, "keepLocallyInput"))

    @builtins.property # type: ignore[misc]
    @jsii.member(jsii_name="pullTriggerInput")
    def pull_trigger_input(self) -> typing.Optional[builtins.str]:
        return typing.cast(typing.Optional[builtins.str], jsii.get(self, "pullTriggerInput"))

    @builtins.property # type: ignore[misc]
    @jsii.member(jsii_name="pullTriggersInput")
    def pull_triggers_input(self) -> typing.Optional[typing.List[builtins.str]]:
        return typing.cast(typing.Optional[typing.List[builtins.str]], jsii.get(self, "pullTriggersInput"))

    @builtins.property # type: ignore[misc]
    @jsii.member(jsii_name="keepLocally")
    def keep_locally(self) -> builtins.bool:
        return typing.cast(builtins.bool, jsii.get(self, "keepLocally"))

    @keep_locally.setter
    def keep_locally(self, value: builtins.bool) -> None:
        jsii.set(self, "keepLocally", value)

    @builtins.property # type: ignore[misc]
    @jsii.member(jsii_name="name")
    def name(self) -> builtins.str:
        return typing.cast(builtins.str, jsii.get(self, "name"))

    @name.setter
    def name(self, value: builtins.str) -> None:
        jsii.set(self, "name", value)

    @builtins.property # type: ignore[misc]
    @jsii.member(jsii_name="pullTrigger")
    def pull_trigger(self) -> builtins.str:
        return typing.cast(builtins.str, jsii.get(self, "pullTrigger"))

    @pull_trigger.setter
    def pull_trigger(self, value: builtins.str) -> None:
        jsii.set(self, "pullTrigger", value)

    @builtins.property # type: ignore[misc]
    @jsii.member(jsii_name="pullTriggers")
    def pull_triggers(self) -> typing.List[builtins.str]:
        return typing.cast(typing.List[builtins.str], jsii.get(self, "pullTriggers"))

    @pull_triggers.setter
    def pull_triggers(self, value: typing.List[builtins.str]) -> None:
        jsii.set(self, "pullTriggers", value)
```

Taking a look at the `latest` method as an example you can see that the actual implementation is inside of the Typescript code. The method has a decorator that declares it a property and one that defines it's name inside JSII.
For the implementation you can see that it executes `jsii.get`, this is a call to the Node.js process implementing the logic. We will see the inter-process communication in the next section.

## Synthesizing a CDKTF Python stack (`cdktf synth`)

The `cdktf synth` command executes the `app` command specified in the `cdktf.json`, which executes the command in a process. The command runs the CDK program, which creates [Constructs](https://github.com/aws/constructs) inside Node.js. This is done through [JSII](https://aws.github.io/jsii/).

[JSII uses stdin, stdout, and stderror to communicate between the target language thread and the node.js thread](https://aws.github.io/jsii/overview/runtime-architecture/).
If you want to see these messages in action you can use the `JSII_DEBUG=1` environment variable and JSII will print the communication.

Let's walk through the messages sent between the two processes when executing

```py
docker_image = Image(self, 'nginx-latest', name='nginx:latest', keep_locally=False)
```

The Python process sends a serialized request to create the image construct to the Node.js process:

```json
{
  "fqn": "kreuzwerker_docker.Image",
  "args": [
    {
      "$jsii.byref": "cdktf.TerraformStack@10001"
    },
    "nginx-latest",
    {
      "$jsii.struct": {
        "fqn": "kreuzwerker_docker.ImageConfig",
        "data": {
          "count": null,
          "dependsOn": null,
          "lifecycle": null,
          "provider": null,
          "name": "nginx:latest",
          "buildAttribute": null,
          "forceRemove": null,
          "keepLocally": false,
          "pullTrigger": null,
          "pullTriggers": null
        }
      }
    }
  ],
  "overrides": [],
  "interfaces": [
    "constructs.IConstruct",
    "cdktf.ITerraformResource",
    "cdktf.ITerraformDependable"
  ],
  "api": "create"
}
```

The `api` field indicates that we want to create a resource, the `fqn` field specifies which resource and the `args` field notes the arguments passed to the call.
The first argument (`self` in the python code) is an object with a `$jsii.byref` field, this denotes an JSII-internal reference to a previously created object.
The second argument is a string literal, it's transferred as such.
The third argument is an object, it's serialized through a `$jsii.struct` which has a `fqn` field for the type to be created and the `data` field for the data of the struct. The `null` values are defaults when no value is provided.

The answer on this JSON is:

```json
{
  "ok": {
    "$jsii.byref": "kreuzwerker_docker.Image@10003"
  }
}
```

This is a reference to a specific docker image that was created in the Node.js context based on the specification we passed to it.

Now we want to use this image resource and get the name of the image into the docker container.

```python
Container(self, 'nginx-cdktf', name='nginx-python-cdktf',
          image=docker_image.name, ports=[
              {
                  'internal': 80,
                  'external': 8000
              }], privileged=False)
```

The property access `docker_image.name` leads to this call to the Node.js process:

```json
{
  "objref": {
    "$jsii.byref": "kreuzwerker_docker.Image@10003"
  },
  "property": "name",
  "api": "get"
}
```

The api used is `get` so the python process asks the Node.js environment for the value in the `property` of an object specified through `objref`. The object is the same reference that was returned when we created the Docker Image.

The result of the call is:

```json
{
  "ok": {
    "value": "${docker_image.pythondocker_nginxlatest_BB45EBC9.name}"
  }
}
```

The value is a terraform reference for the docker image name that will now be used in the container. The resource name is prefixed with the stack name and suffixed with a hash based on the hierarchical path to the resource. This means if you wrap the Construct in another scope, e.g. by wrapping it in a class extending Resource you would get a different hash to avoid conflicts.

All data for the container is gathered so a message is sent to construct it:

```json
{
  "fqn": "kreuzwerker_docker.Container",
  "args": [
    { "$jsii.byref": "cdktf.TerraformStack@10001" },
    "nginx-cdktf",
    {
      "$jsii.struct": {
        "fqn": "kreuzwerker_docker.ContainerConfig",
        "data": {
          "count": null,
          "dependsOn": null,
          "lifecycle": null,
          "provider": null,
          "image": "${docker_image.currentimplementationexample_nginxlatest_BB45EBC9.name}",
          "name": "nginx-python-cdktf",
          "attach": null,
          "capabilities": null,
          "command": null,
          "cpuSet": null,
          "cpuShares": null,
          "destroyGraceSeconds": null,
          "devices": null,
          "dns": null,
          "dnsOpts": null,
          "dnsSearch": null,
          "domainname": null,
          "entrypoint": null,
          "env": null,
          "groupAdd": null,
          "healthcheck": null,
          "host": null,
          "hostname": null,
          "init": null,
          "ipcMode": null,
          "labels": null,
          "links": null,
          "logDriver": null,
          "logOpts": null,
          "logs": null,
          "maxRetryCount": null,
          "memory": null,
          "memorySwap": null,
          "mounts": null,
          "mustRun": null,
          "networkAlias": null,
          "networkMode": null,
          "networks": null,
          "networksAdvanced": null,
          "pidMode": null,
          "ports": [{ "$jsii.map": { "internal": 80, "external": 8000 } }],
          "privileged": false,
          "publishAllPorts": null,
          "readOnly": null,
          "removeVolumes": null,
          "restart": null,
          "rm": null,
          "securityOpts": null,
          "shmSize": null,
          "start": null,
          "stdinOpen": null,
          "sysctls": null,
          "tmpfs": null,
          "tty": null,
          "ulimit": null,
          "upload": null,
          "user": null,
          "usernsMode": null,
          "volumes": null,
          "workingDir": null
        }
      }
    }
  ],
  "overrides": [],
  "interfaces": [
    "constructs.IConstruct",
    "cdktf.ITerraformResource",
    "cdktf.ITerraformDependable"
  ],
  "api": "create"
}
```

As you can see the image is using the terraform reference provided.

The creation is confirmed by this message:

```json
{ "ok": { "$jsii.byref": "kreuzwerker_docker.Container@10004" } }
```

Inside the Node.js process these invocations form a tree of scopes (e.g. stacks / resource classes) and individual resources.
The underlying [constructs](https://github.com/aws/constructs) library calls the `onSynthesise` methods on each node of the tree. The `TerraformStack` resource generates a Terraform JSON Manifest that represents the infrastructure. This is done by walking through the Constructs Tree, where on each node the `toTerraform` serlialization function is called.

For the given program this results in this JSON:

```jsonc
{
  "//": {
    "metadata": {
      "version": "0.0.0",
      "stackName": "python-docker"
    }
  },
  "terraform": {
    "required_providers": {
      "docker": {
        "version": "~> 2.0",
        "source": "terraform-providers/docker"
      }
    }
  },
  "provider": {
    "docker": [{}]
  },
  "resource": {
    "docker_image": {
      "pythondocker_nginxlatest_BB45EBC9": {
        "keep_locally": false,
        "name": "nginx:latest",
        "//": {
          "metadata": {
            "path": "python-docker/nginxImage",
            "uniqueId": "pythondocker_nginxlatest_BB45EBC9",
            "stackTrace": [
              // ...
            ]
          }
        }
      }
    },
    "docker_container": {
      "pythondocker_nginxContainer_27657FE9": {
        "image": "${docker_image.pythondocker_nginxlatest_BB45EBC9.latest}",
        "name": "tutorial",
        "ports": [
          {
            "external": 8000,
            "internal": 80
          }
        ],
        "//": {
          "metadata": {
            "path": "python-docker/nginxContainer",
            "uniqueId": "pythondocker_nginxContainer_27657FE9",
            "stackTrace": [
              // ...
            ]
          }
        }
      }
    }
  }
}
```

You can see the same identifiers as above and you can see that terraform references (`${docker_image.pythondocker_nginxlatest_BB45EBC9.latest}`) are being used.

## Running Terraform (`cdktf diff` / `cdktf deploy`)

When deploying a CDKTF stack, the cdktf-cli invokes Terraform to apply the generated configuration (that is the `cdk.tf.json` file).



todo: show how cdktf-cli dermines stack and invokes Terraform
