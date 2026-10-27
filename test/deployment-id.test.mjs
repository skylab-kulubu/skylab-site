import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));

// The config `next build` sees, with NEXT_DEPLOYMENT_ID as the image build sets it. Next keeps
// the loaded config for the process, so each case loads it in a process of its own.
function deploymentId(value) {
  const env = { ...process.env };
  if (value === undefined) delete env.NEXT_DEPLOYMENT_ID;
  else env.NEXT_DEPLOYMENT_ID = value;
  const script = `
    const { default: loadConfig } = require("next/dist/server/config");
    const { PHASE_PRODUCTION_BUILD } = require("next/constants");
    loadConfig(PHASE_PRODUCTION_BUILD, process.cwd(), { silent: true })
      .then((config) => process.stdout.write(JSON.stringify({ id: config.deploymentId ?? null })));
  `;
  return JSON.parse(execFileSync(process.execPath, ["-e", script], { cwd: root, env, encoding: "utf8" })).id;
}

test("the image's commit becomes the deployment id, so a page from the old task reloads on the new one", () => {
  const sha = "0123456789abcdef0123456789abcdef01234567";
  assert.equal(deploymentId(sha), sha);
});

test("a build without NEXT_DEPLOYMENT_ID has no deployment id, as before", () => {
  assert.equal(deploymentId(undefined), null);
  assert.equal(deploymentId(""), null);
});

test("the image build passes the commit to next build", async () => {
  const { readFile } = await import("node:fs/promises");
  const dockerfile = await readFile(new URL("../Dockerfile", import.meta.url), "utf8");
  const workflow = await readFile(new URL("../.github/workflows/ghcr.yml", import.meta.url), "utf8");
  assert.match(dockerfile, /ARG NEXT_DEPLOYMENT_ID\nENV NEXT_DEPLOYMENT_ID=\$NEXT_DEPLOYMENT_ID/);
  assert.match(workflow, /NEXT_DEPLOYMENT_ID=\$\{\{ github\.sha \}\}/);
});
