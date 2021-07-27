import { parse, convertFiles, parseExpression } from "../lib";
import * as fs from "fs";
import * as path from "path";

describe("parse", () => {
  const loadFixture = (...fileNames: string[]) => {
    return fs.readFileSync(
      path.join(__dirname, "fixtures", ...fileNames),
      "utf-8"
    );
  };

  test("converts VPC module", async () => {
    const parsed = await parse("vpc.tf", loadFixture("vpc-module", "main.tf"));
    expect(JSON.stringify(parsed, null, 2)).toMatchSnapshot();
  });
});

describe("convertFiles", () => {
  test("a simple directory", async () => {
    const parsed = await convertFiles(
      path.join(__dirname, "fixtures", "vpc-module")
    );
    expect(JSON.stringify(parsed, null, 2)).toMatchSnapshot();
  });

  test("a directory with multiple files", async () => {
    const parsed = await convertFiles(
      path.join(__dirname, "fixtures", "multiple-files")
    );
    expect(JSON.stringify(parsed, null, 2)).toMatchSnapshot();
  });

  test("a directory with submodule", async () => {
    const parsed = await convertFiles(
      path.join(__dirname, "fixtures", "with-submodule")
    );
    expect(JSON.stringify(parsed, null, 2)).toMatchSnapshot();
  });

  test("a directory with tf json", async () => {
    const parsed = await convertFiles(
      path.join(__dirname, "fixtures", "with-tf-json")
    );
    expect(JSON.stringify(parsed, null, 2)).toMatchSnapshot();
  });

  test("a directory with tf json only", async () => {
    const parsed = await convertFiles(
      path.join(__dirname, "fixtures", "with-tf-json-only")
    );
    expect(JSON.stringify(parsed, null, 2)).toMatchSnapshot();
  });

  test("a directory with standard json only", async () => {
    const parsed = await convertFiles(
      path.join(__dirname, "fixtures", "with-standard-json")
    );
    expect(JSON.stringify(parsed, null, 2)).toMatchInlineSnapshot(`"{}"`);
  });

  test("no files", async () => {
    const parsed = await convertFiles(
      path.join(__dirname, "fixtures", "no-files")
    );
    expect(JSON.stringify(parsed, null, 2)).toMatchSnapshot();
  });

  test("invalid files", async () => {
    try {
      await convertFiles(path.join(__dirname, "fixtures", "invalid-files"));
    } catch (e) {
      expect(e.message).toMatch(/Invalid multi-line string/);
    }
  });

  test("invalid path", async () => {
    try {
      await convertFiles(path.join("/some/not/existing/path"));
    } catch (e) {
      expect(e.message).toMatch(/no such file or directory/);
    }
  });
});

describe("parseExpression", () => {
  test.each([
    ["function call", '${lower("HELLO")}'],
    ["method reference", "${lower(var.input)}"],
    ["plain reference", "${docker_image.ubuntu.latest}"],
    [
      "method reference second arg and access",
      "${element(aws_s3_bucket.examplebucket, 0).id}",
    ],
    ["interpolation", "app-${terraform.workspace}"],
    ["multiple vars", "${merge(var.one_set_of_users, var.other_set_of_users)}"],
    [
      "deep access",
      "${google_compute_instance.example.network_interface.0.access_config.0.assigned_nat_ip}",
    ],
    [
      "for expression",
      "${[for record in aws_route53_record.example : record.fqdn]}",
    ],
    [
      "for map",
      `$\{{
      for dvo in aws_acm_certificate.example.domain_validation_options : dvo.domain_name => {
        name   = dvo.resource_record_name
        record = dvo.resource_record_value
        type   = dvo.resource_record_type
      }
    }}`,
    ],
    [
      "arithmetics",
      "${aws_s3_bucket.examplebucket.count + aws_s3_bucket.otherbucket.count}",
    ],
    [
      "conditional",
      "${aws_kms_key.key.deletion_window_in_days > 3 ? aws_s3_bucket.examplebucket.id : []}",
    ],
    ["splat", "${aws_s3_bucket.examplebucket.*.id}"],
    ["splat in method", "${toset(aws_s3_bucket.examplebucket.*)}"],
  ])("%s", async (_name, hclExpr) => {
    const parsed = await parseExpression("filename.hcl", hclExpr);
    expect(parsed).toMatchSnapshot();
  });
});
