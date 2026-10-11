"use client";

import { useMemo } from "react";
import { useCollection } from "inscribed/collections";
import { TEAMS_COLLECTION_KEY, teamsFromItems } from "./fromCollection.js";

// The R&D teams come from the teams collection; children receive them already
// shaped for the section.
export default function TeamsCollection({ children }) {
  const { items } = useCollection(TEAMS_COLLECTION_KEY, { limit: 50 });
  const teams = useMemo(() => teamsFromItems(items), [items]);
  return children(teams);
}
