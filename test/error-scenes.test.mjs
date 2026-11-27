import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// The whole-page errors show the club's error scenes (skylcn-ui ErrorScene, ADR 0055).
// The ticket and certificate pages keep their own words and only gain the scene.

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the 404 is the notFound scene page, inside the root layout's main", () => {
  const page = read("src/app/not-found.tsx");
  assert.match(page, /NotFoundScene/);
  const scene = read("src/components/skylcn/NotFoundScene.tsx");
  assert.match(scene, /<SkylcnScope>/);
  assert.match(scene, /<ErrorScenePage[\s\S]*kind="notFound"[\s\S]*href="\/"[\s\S]*as="div"/);
});

test("error.tsx and global-error.tsx show the 500 scene, or the offline one", () => {
  const scene = read("src/components/skylcn/ErrorScene.tsx");
  assert.match(scene, /^"use client";/);
  assert.match(scene, /ServerErrorScenePage/);
  assert.match(scene, /OfflineScenePage/);
  assert.match(scene, /navigator\.onLine/);
  // A reload, not reset(): leaving the error page must drop skylcn-ui's stylesheet
  assert.match(scene, /window\.location\.reload\(\)/);
  for (const path of ["src/app/error.tsx", "src/app/global-error.tsx"]) {
    const page = read(path);
    assert.match(page, /^"use client";/, path);
    assert.match(page, /<SkylcnScope>[\s\S]*<ErrorScene/, path);
  }
  assert.match(read("src/app/global-error.tsx"), /<html lang="tr">[\s\S]*<body>/);
});

test("the ticket page keeps its words and draws the matching scene", () => {
  const page = read("src/app/bilet/[key]/page.tsx");
  assert.match(page, /"Bilet bulunamadı"/);
  assert.match(page, /"Bu bilet artık açık değil\."/);
  assert.match(page, /"Bilet şu an açılamıyor"/);
  assert.match(page, /kind === "unavailable"\) return <ErrorScene kind="unavailable" variant=\{statusSceneVariant\("unavailable", 503\)\}/);
  assert.match(page, /kind === "closed"\) return <ErrorScene kind="linkExpired"/);
  assert.match(page, /<ErrorScene kind="notFound"/);
  assert.match(page, /scene=\{scene\(kind\)\}/);
});

test("the certificate page keeps its words and draws the matching scene", () => {
  const page = read("src/app/sertifika/[serial]/page.tsx");
  assert.match(page, /"Doğrulama şu anda kullanılamıyor" : "Sertifika bulunamadı"/);
  assert.match(page, /<ErrorScene kind="unavailable" variant=\{statusSceneVariant\("unavailable", 503\)\}/);
  assert.match(page, /<ErrorScene kind="notFound" variant=\{pickErrorSceneVariant\("notFound"\)\}/);
});
