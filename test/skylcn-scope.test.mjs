import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

// The door (/kapi) and certificate (/sertifika) pages are drawn with skylcn-ui
// (ADR 0055); the rest of the site is not. skylcn-ui's theme rewrites the tokens
// and base styles the site's own globals.css sets, so it stays inside those routes.

const root = new URL("..", import.meta.url).pathname;
const SCOPED = ["src/app/kapi", "src/app/sertifika", "src/components/door", "src/components/skylcn"];

function filesUnder(dir) {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name);
    return statSync(join(root, path)).isDirectory() ? filesUnder(path) : [path];
  });
}

const sources = filesUnder("src").filter((path) => /\.(tsx?|jsx?|mjs|css)$/.test(path));
const isScoped = (path) => SCOPED.some((dir) => path.startsWith(`${dir}/`));

test("the site's global stylesheet does not load skylcn-ui", () => {
  const globals = readFileSync(join(root, "src/app/globals.css"), "utf8");
  assert.doesNotMatch(globals, /skylcn-ui/);
});

test("only the skylcn-ui pages use skylcn-ui and its stylesheet", () => {
  const outside = sources.filter(
    (path) => !isScoped(path) && /@skylab-kulubu\/skylcn-ui|skylcn-scope\.css/.test(readFileSync(join(root, path), "utf8")),
  );
  assert.deepEqual(outside, []);
});

// A stylesheet a route loads stays in the document after a client-side
// navigation. These pages have no next/link, so leaving them is a full page
// load and skylcn-ui's theme never reaches another page of the site.
test("the skylcn-ui pages are left only through full page loads", () => {
  const linking = sources.filter((path) => isScoped(path) && /from ["']next\/link["']/.test(readFileSync(join(root, path), "utf8")));
  assert.deepEqual(linking, []);
});

// The site has no theme switch and is dark throughout, so these pages are too:
// no ThemeScript reads a light choice remembered by another skylcn-ui product.
test("the skylcn-ui pages are always dark", () => {
  const scope = readFileSync(join(root, "src/components/skylcn/SkylcnScope.tsx"), "utf8");
  assert.match(scope, /data-theme="dark"/);
  const choosing = sources.filter((path) => /ThemeScript|useTheme|skylcn:theme/.test(readFileSync(join(root, path), "utf8")));
  assert.deepEqual(choosing, []);
});

// The scope stylesheet takes skylcn-ui's theme without its components and one
// sources/<file>.css per component file these pages import, so their CSS holds
// only what they draw. A component used here without its line would draw unstyled.
test("the skylcn-ui pages' stylesheet lists every component file they import", () => {
  const dist = join(root, "node_modules/@skylab-kulubu/skylcn-ui/dist");
  const index = readFileSync(join(dist, "index.js"), "utf8");
  // A component file can pass on another's export (app-shell hands on SkylabMark):
  // the stylesheet is named after the file that draws it.
  const definedIn = (name, file) => {
    const code = readFileSync(join(dist, "components", `${file}.js`), "utf8");
    if (new RegExp(`(function|const|class)\\s+${name}\\b`).test(code)) return file;
    const from = code.match(new RegExp(`import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*'\\./([\\w-]+)\\.js'`));
    return from ? from[1] : file;
  };
  const fileOf = new Map();
  for (const [, names, file] of index.matchAll(/export\s*\{([^}]*)\}\s*from\s*'\.\/components\/([\w-]+)\.js'/g)) {
    for (const name of names.split(",")) {
      const exported = name.trim().split(/\s+as\s+/).pop();
      if (exported) fileOf.set(exported, definedIn(exported, file));
    }
  }
  const needed = new Set();
  for (const path of sources.filter(isScoped)) {
    const text = readFileSync(join(root, path), "utf8");
    for (const [, names] of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@skylab-kulubu\/skylcn-ui["']/g)) {
      for (const name of names.split(",")) {
        const file = fileOf.get(name.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0]);
        if (file) needed.add(file);
      }
    }
  }
  const scope = readFileSync(join(root, "src/components/skylcn/skylcn-scope.css"), "utf8");
  assert.doesNotMatch(scope, /skylcn-ui\/theme\.css/);
  const listed = new Set([...scope.matchAll(/skylcn-ui\/sources\/([\w-]+)\.css/g)].map((m) => m[1]));
  assert.ok(needed.size > 0);
  assert.deepEqual([...needed].filter((file) => !listed.has(file)).sort(), []);
});
