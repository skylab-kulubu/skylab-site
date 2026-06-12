const TEAM_META = {
  airlab: {
    name: "AIR LAB",
    category: "Ar-Ge",
    logoWhite: { src: "/img/teams/airbeyaz.png", alt: "AIR LAB" },
    logoColor: { src: "/img/teams/airrenkli.png", alt: "AIR LAB" },
  },
  algolab: {
    name: "ALGOLAB",
    category: "Ar-Ge",
    logoWhite: { src: "/img/teams/algolabbeyaz.png", alt: "ALGOLAB" },
    logoColor: { src: "/img/teams/algolab.png", alt: "ALGOLAB" },
  },
  chainlab: {
    name: "CHAINLAB",
    category: "Ar-Ge",
    logoWhite: { src: "/img/teams/chainlabbeyaz.png", alt: "CHAINLAB" },
    logoColor: { src: "/img/teams/chainlabrenkli.png", alt: "CHAINLAB" },
  },
  gamelab: {
    name: "GAME LAB",
    category: "Ar-Ge",
    logoWhite: { src: "/img/teams/gamelabbeyaz.png", alt: "GAME LAB" },
    logoColor: { src: "/img/teams/gamelabrenkli.png", alt: "GAME LAB" },
  },
  mobilab: {
    name: "MOBILAB",
    category: "Ar-Ge",
    logoWhite: { src: "/img/teams/mobilabbeyaz.svg", alt: "MOBILAB" },
    logoColor: { src: "/img/teams/mobilabrenkli.svg", alt: "MOBILAB" },
  },
  skysec: {
    name: "SKY-SEC",
    category: "Ar-Ge",
    logoWhite: { src: "/img/teams/skysecbeyaz.png", alt: "SKY-SEC" },
    logoColor: { src: "/img/teams/skysecrenkli.png", alt: "SKY-SEC" },
  },
  skysis: {
    name: "SKYSIS",
    category: "Ar-Ge",
    logoWhite: { src: "/img/teams/skysisbeyaz.png", alt: "SKYSIS" },
    logoColor: { src: "/img/teams/skysis.png", alt: "SKYSIS" },
  },
  weblab: {
    name: "WEBLAB",
    category: "Ar-Ge",
    logoWhite: { src: "/img/teams/weblablogobeyaz.svg", alt: "WEBLAB" },
    logoColor: { src: "/img/teams/weblablogorenkli.svg", alt: "WEBLAB" },
  },
};

const TEAM_ORDER = Object.keys(TEAM_META);

function teamFromItem(item) {
  const meta = TEAM_META[item.slug] ?? {};
  const data = item.data ?? {};
  return {
    id: item.slug,
    slug: item.slug,
    name: meta.name ?? item.slug,
    category: meta.category ?? "Ar-Ge",
    logoWhite: meta.logoWhite ?? { src: "", alt: "" },
    logoColor: meta.logoColor ?? { src: "", alt: "" },
    description: data.desc ?? "",
    longDesc: data.longDesc ?? "",
    recruiting: Boolean(data.recruiting),
    recruitingFor: data.recruitingFor ?? "",
    applyUrl: data.applyUrl ?? "",
    stack: Array.isArray(data.stack) ? data.stack : [],
    topics: Array.isArray(data.topics) ? data.topics : [],
    version: item.version,
    canEdit: Boolean(item.canEdit),
  };
}

export function teamsFromItems(items) {
  const bySlug = new Map((items ?? []).map((item) => [item.slug, item]));
  const ordered = [];

  for (const slug of TEAM_ORDER) {
    const item = bySlug.get(slug);
    if (item) {
      ordered.push(teamFromItem(item));
      bySlug.delete(slug);
    }
  }
  for (const item of bySlug.values()) {
    ordered.push(teamFromItem(item));
  }
  return ordered;
}
