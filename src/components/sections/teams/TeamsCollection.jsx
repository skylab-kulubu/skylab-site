"use client";

import { useMemo } from "react";
import { CollectionRegion } from "inscribed";
import { TEAMS_COLLECTION_KEY, teamsFromItems } from "./fromCollection.js";

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
