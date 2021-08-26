import { Testing, TerraformStack, TerraformOutput, fn } from "../lib";
import { TerraformVariable } from "../lib/terraform-variable";
import { TerraformLocal } from "../lib/terraform-local";

test("static values", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  new TerraformOutput(stack, "test-output", {
    value: fn.numeric.abs(-42),
  });
  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${abs(-42)}\\"
        }
      }
    }"
  `);
});

test("dynamic values", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  const variable = new TerraformVariable(stack, "test-var", {
    type: "number",
  });

  new TerraformOutput(stack, "test-output", {
    value: fn.numeric.abs(variable.value),
  });
  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"variable\\": {
        \\"test-var\\": {
          \\"type\\": \\"number\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${abs(var.test-var)}\\"
        }
      }
    }"
  `);
});

test("spreaded mixed values", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  const variable = new TerraformVariable(stack, "test-var", {
    type: "number",
  });

  new TerraformOutput(stack, "test-output", {
    value: fn.numeric.max([10, variable.value, 200]),
  });
  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"variable\\": {
        \\"test-var\\": {
          \\"type\\": \\"number\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${max(10, var.test-var, 200)}\\"
        }
      }
    }"
  `);
});

test("spreaded token value", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  const variable = new TerraformVariable(stack, "test-var", {
    type: "list(number)",
  });

  new TerraformOutput(stack, "test-output", {
    value: fn.numeric.max([variable.value]),
  });
  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"variable\\": {
        \\"test-var\\": {
          \\"type\\": \\"list(number)\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${max(var.test-var)}\\"
        }
      }
    }"
  `);
});

test("string values", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  new TerraformOutput(stack, "test-output", {
    value: fn.numeric.parseInt("-210", 10),
  });
  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${parseInt(\\\\\\"-210\\\\\\", 10)}\\"
        }
      }
    }"
  `);
});

test("mixed string spreads values", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  const variable = new TerraformVariable(stack, "test-var", {
    type: "number",
  });

  new TerraformOutput(stack, "test-output", {
    value: fn.string.format("There are %d out of %d lights are on in %s", [
      variable.value,
      4,
      "Hamburg",
    ]),
  });
  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"variable\\": {
        \\"test-var\\": {
          \\"type\\": \\"number\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${format(\\\\\\"There are %d out of %d lights are on in %s\\\\\\", var.test-var, 4, \\\\\\"Hamburg\\\\\\")}\\"
        }
      }
    }"
  `);
});

test("combined functions", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  const index = new TerraformVariable(stack, "index", {
    type: "number",
  });

  const list = new TerraformVariable(stack, "list", {
    type: `list(object({
      internal = number
      external = number
      protocol = string
    }))`,
  });

  new TerraformOutput(stack, "test-output", {
    value: fn.type.tryExpression([
      fn.collection.lookup(
        fn.collection.element(list.value, index.value),
        "internal",
        "waaat"
      ),
      fn.date.timestamp(),
      fn.crypto.uuid(),
    ]),
  });

  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"variable\\": {
        \\"index\\": {
          \\"type\\": \\"number\\"
        },
        \\"list\\": {
          \\"type\\": \\"list(object({\\\\n      internal = number\\\\n      external = number\\\\n      protocol = string\\\\n    }))\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${try(lookup(element(var.list, var.index), \\\\\\"internal\\\\\\", \\\\\\"waaat\\\\\\"), timestamp(), uuid())}\\"
        }
      }
    }"
  `);
});

test("function with varadic args", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  const variable = new TerraformVariable(stack, "test-var", {
    type: "list(number)",
  });

  new TerraformOutput(stack, "test-output", {
    value: fn.collection.merge([variable.value, [1, 2, 3]]),
  });

  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"variable\\": {
        \\"test-var\\": {
          \\"type\\": \\"list(number)\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${merge(var.test-var, [1, 2, 3])}\\"
        }
      }
    }"
  `);
});

test("complex example", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  const variable1 = new TerraformVariable(stack, "test-var1", {
    type: "list(number)",
  });
  const variable2 = new TerraformVariable(stack, "test-var2", {
    type: "list(number)",
  });

  new TerraformOutput(stack, "test-output", {
    value: fn.network.cidrsubnet(
      fn.collection.element(
        fn.collection.merge([variable1.value, variable2.value]),
        3
      ),
      4,
      2
    ),
  });

  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"variable\\": {
        \\"test-var1\\": {
          \\"type\\": \\"list(number)\\"
        },
        \\"test-var2\\": {
          \\"type\\": \\"list(number)\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${cidrsubnet(element(merge(var.test-var1, var.test-var2), 3), 4, 2)}\\"
        }
      }
    }"
  `);
});

test("interpolation within string ", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  const variable = new TerraformVariable(stack, "test-var", {
    type: "number",
  });

  new TerraformOutput(stack, "test-output", {
    value: fn.network.cidrsubnet(`172.16.0.0/${variable.value}`, 2, 3),
  });

  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"variable\\": {
        \\"test-var\\": {
          \\"type\\": \\"number\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${cidrsubnet(\\\\\\"172.16.0.0/\${var.test-var}\\\\\\", 2, 3)}\\"
        }
      }
    }"
  `);
});

test("functions with object inputs", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  const variable = new TerraformVariable(stack, "test-var", {
    type: `number`,
  });

  new TerraformOutput(stack, "test-output", {
    value: fn.collection.lookup(
      { var: variable.value, stat: 4, internal: true, yes: "no" },
      "internal",
      "waaat"
    ),
  });

  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"variable\\": {
        \\"test-var\\": {
          \\"type\\": \\"number\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${lookup({var = var.test-var, stat = 4, internal = true, yes = \\\\\\"no\\\\\\"}, \\\\\\"internal\\\\\\", \\\\\\"waaat\\\\\\")}\\"
        }
      }
    }"
  `);
});

test("quoted primitives in list", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  new TerraformOutput(stack, "test-output", {
    value: fn.string.join(", ", ["world", "hello"]),
  });

  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${join(\\\\\\", \\\\\\", [\\\\\\"world\\\\\\", \\\\\\"hello\\\\\\"])}\\"
        }
      }
    }"
  `);
});

test("quoted primitives, unquoted functions", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  new TerraformOutput(stack, "test-output", {
    value: fn.string.join(", ", [
      fn.string.join(" ", fn.collection.reverse(["world", "hello"])),
    ]),
  });

  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${join(\\\\\\", \\\\\\", [join(\\\\\\" \\\\\\", reverse([\\\\\\"world\\\\\\", \\\\\\"hello\\\\\\"]))])}\\"
        }
      }
    }"
  `);
});

test("terraform local", () => {
  const app = Testing.app();
  const stack = new TerraformStack(app, "test");

  const local = new TerraformLocal(stack, "list", ["world", "hello"]);

  new TerraformOutput(stack, "test-output", {
    value: fn.collection.reverse(local.asList),
  });

  expect(Testing.synth(stack)).toMatchInlineSnapshot(`
    "{
      \\"//\\": {
        \\"metadata\\": {
          \\"version\\": \\"stubbed\\",
          \\"stackName\\": \\"test\\",
          \\"backend\\": \\"local\\"
        }
      },
      \\"locals\\": {
        \\"list\\": [
          \\"world\\",
          \\"hello\\"
        ]
      },
      \\"output\\": {
        \\"test-output\\": {
          \\"value\\": \\"\${reverse(local.list)}\\"
        }
      }
    }"
  `);
});
