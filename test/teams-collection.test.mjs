import assert from "node:assert/strict";
import { test } from "node:test";

import {
  TEAMS_COLLECTION_KEY,
  teamsFromItems,
} from "../src/components/sections/teams/fromCollection.js";

test("the Teams key is one inscribed accepts", () => {
  // inscribed CollectionDefinitionParser.KeyPattern; "Teams" gets a 404.
  assert.match(TEAMS_COLLECTION_KEY, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.equal(TEAMS_COLLECTION_KEY, "teams");
});

test("an inscribed list item still maps to a team card", () => {
  const [team] = teamsFromItems([
    {
      id: "0b8f7f3e-0000-4000-8000-000000000001",
      collectionKey: "teams",
      slug: "weblab",
      data: { desc: "Web", recruiting: true, stack: ["Next.js"] },
      version: 3,
      translationGroupId: "0b8f7f3e-0000-4000-8000-000000000002",
      createdAt: "2026-09-27T00:00:00Z",
      updatedAt: "2026-09-27T00:00:00Z",
      canEdit: true,
    },
  ]);

  assert.equal(team.slug, "weblab");
  assert.equal(team.name, "WEBLAB");
  assert.equal(team.description, "Web");
  assert.equal(team.recruiting, true);
  assert.deepEqual(team.stack, ["Next.js"]);
  assert.equal(team.version, 3);
  assert.equal(team.canEdit, true);
});
