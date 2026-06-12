"use client";

import { useMemo } from "react";
import { CollectionRegion } from "inscribed";
import { teamsFromItems } from "./fromCollection.js";

const TEAMS_COLLECTION_KEY = "Teams";

function TeamsBinding({ items, meta, children }) {
  const teams = useMemo(() => teamsFromItems(items), [items]);
  return children(teams, meta);
}

export default function TeamsCollection({ blockPath = "teams", children }) {
  return (
    <CollectionRegion
      blockPath={blockPath}
      collection={TEAMS_COLLECTION_KEY}
      limit={50}
    >
      {(items, meta) => (
        <TeamsBinding items={items} meta={meta}>
          {children}
        </TeamsBinding>
      )}
    </CollectionRegion>
  );
}
