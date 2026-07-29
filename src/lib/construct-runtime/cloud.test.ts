import assert from "node:assert/strict";
import test from "node:test";
import { constructRuntimeHeaders } from "@construct/sdk/next/server";
import { constructCloudOverrideForPlatformApi } from "./cloud.ts";

function contentSecurityPolicy(
  platformApiUrl: string | undefined,
  development = false,
): string {
  const rules = constructRuntimeHeaders(
    constructCloudOverrideForPlatformApi(platformApiUrl),
    { development },
  );
  const policy = rules[0]?.headers.find((header) => header.key === "Content-Security-Policy")?.value;
  assert.ok(policy);
  return policy;
}

test("loopback APIs permit the local control plane without compiler policy", () => {
  for (const platformApiUrl of ["http://127.0.0.1:4100", "http://localhost:4100/"]) {
    const policy = contentSecurityPolicy(platformApiUrl);
    assert.match(policy, /frame-ancestors 'self' http:\/\/localhost:4200/);
    assert.doesNotMatch(policy, /unsafe-eval/);
  }
});

test("the development API permits the app-dev control plane", () => {
  const policy = contentSecurityPolicy("https://api-dev.thejesselee.com");

  assert.match(policy, /frame-ancestors 'self' https:\/\/app-dev\.thejesselee\.com/);
  assert.doesNotMatch(policy, /http:\/\/localhost:4200/);
  assert.doesNotMatch(policy, /unsafe-eval/);
});

test("production API permits only the production Construct control plane", () => {
  const policy = contentSecurityPolicy("https://api.thejesselee.com");

  assert.match(policy, /frame-ancestors 'self' https:\/\/app\.thejesselee\.com/);
  assert.doesNotMatch(policy, /http:\/\/localhost:4200/);
  assert.doesNotMatch(policy, /unsafe-eval/);
});

test("an unset internal API retains SDK defaults", () => {
  const policy = contentSecurityPolicy(undefined);

  assert.match(policy, /frame-ancestors 'self' https:\/\/app-dev\.thejesselee\.com/);
  assert.doesNotMatch(policy, /http:\/\/localhost:4200/);
});

test("local Next development deduplicates the local control plane", () => {
  const policy = contentSecurityPolicy("http://127.0.0.1:4100", true);

  assert.equal(policy.match(/http:\/\/localhost:4200/g)?.length, 1);
  assert.match(policy, /unsafe-eval/);
});

test("unknown or non-origin internal endpoints fail closed", () => {
  assert.throws(
    () => constructCloudOverrideForPlatformApi("https://api.other.example"),
    /recognized Construct API origin/,
  );
  assert.throws(
    () => constructCloudOverrideForPlatformApi("https://api.thejesselee.com/runtime"),
    /credential-free origin/,
  );
  assert.throws(
    () => constructCloudOverrideForPlatformApi("not a url"),
    /valid URL/,
  );
});
