import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import {
  KubernetesProvider,
  Namespace,
  Deployment,
  Service,
} from "./.gen/providers/kubernetes";

class KubeStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new KubernetesProvider(this, "kind", {});

    const exampleNamespace = new Namespace(this, "tf-cdk-example", {
      metadata: {
        name: "tf-cdk-example",
      },
    });

    const app = "nginx-example";
    // const nginx =
    new Deployment(this, "nginx-deployment", {
      metadata: {
        name: app,
        namespace: exampleNamespace.metadata.name,
        labels: {
          app,
        },
      },
      spec: {
        replicas: 2,
        selector: {
          matchLabels: {
            app,
          },
        },
        template: {
          metadata: {
            labels: {
              app,
            },
          },
          spec: {
            container: [
              {
                image: "nginx:1.7.8",
                name: "example",
                port: [
                  {
                    containerPort: 80,
                  },
                ],
                resources: {
                  limits: {
                    cpu: "0.5",
                    memory: "512Mi",
                  },
                  requests: {
                    cpu: "250m",
                    memory: "50Mi",
                  },
                },
              },
            ],
          },
        },
      },
    });

    // const single = new Deployment(this, "single-nginx", {
    //   metadata: nginx.metadata,
    //   spec: {
    //     replicas: 1,
    //     selector: nginx.spec.selector,
    //     template: {
    //       metadata: nginx.spec.template.metadata,
    //       spec: {
    //         container: nginx.spec.template.spec.container,
    //       },
    //     },
    //   },
    // });
    // single.metadata.name = "single-nginx";

    new Service(this, "nginx-service", {
      metadata: {
        name: app,
        namespace: exampleNamespace.metadata.name,
      },
      spec: {
        selector: {
          app,
        },
        port: [
          {
            nodePort: 30201,
            port: 80,
            targetPort: "80",
          },
        ],
        type: "NodePort",
      },
    });
  }
}

const app = new App();
new KubeStack(app, "tf-cdk-example");
app.synth();
