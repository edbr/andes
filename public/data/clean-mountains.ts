import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const input = path.resolve(__dirname, "mountain-volcano.geojson");
const output = path.resolve(__dirname, "mountain-volcano-clean.geojson");

const geojson = JSON.parse(fs.readFileSync(input, "utf-8"));
const features = Array.isArray(geojson.features) ? geojson.features : [];

// ------------------------------------------------------------
// CONFIG — tune once, reuse forever
// ------------------------------------------------------------
const MIN_PEAK_ELEVATION = 3000;      // meters
const MIN_NAMED_ELEVATION = 2500;     // meters
const MIN_PROMINENCE = 600;           // meters
const COORD_PRECISION = 5;

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const roundTo = (n: number, digits = COORD_PRECISION) =>
  Number(n.toFixed(digits));

const toNumber = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// ------------------------------------------------------------
// 1) Filter to ski-relevant volcanoes + peaks
// ------------------------------------------------------------
const filtered = features.filter((f: any) => {
  const p = f?.properties || {};
  const natural = p.natural;

  const name =
    typeof p.name === "string" && p.name.trim().length > 0;

  const ele = toNumber(p.ele);
  const prominence = toNumber(p.prominence);

  // ------------------------
  // Volcanoes = ski objectives
  // ------------------------
  if (natural === "volcano") {
    return Boolean(
      name ||
      p["volcano:status"] ||
      p["volcano:type"] ||
      ele ||
      prominence ||
      p.wikidata ||
      p.wikipedia ||
      p.image
    );
  }

  // ------------------------
  // Peaks = only ski-relevant
  // ------------------------
  if (natural === "peak") {
    return (
      (ele !== null && ele >= MIN_PEAK_ELEVATION) ||
      (prominence !== null && prominence >= MIN_PROMINENCE) ||
      (name && ele !== null && ele >= MIN_NAMED_ELEVATION)
    );
  }

  return false;
});

// ------------------------------------------------------------
// 2) Deduplicate stacked features by rounded coordinates
//    Prefer node/* > way/* > relation/*
// ------------------------------------------------------------
const byCoord = new Map<string, any>();

for (const f of filtered) {
  const coords = f?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) continue;

  const lng = toNumber(coords[0]);
  const lat = toNumber(coords[1]);
  if (lng === null || lat === null) continue;

  const key = `${roundTo(lng)},${roundTo(lat)}`;

  if (!byCoord.has(key)) {
    byCoord.set(key, f);
    continue;
  }

  const existing = byCoord.get(key);

  const idA = String(existing?.id || existing?.properties?.["@id"] || "");
  const idB = String(f?.id || f?.properties?.["@id"] || "");

  const rank = (id: string) =>
    id.startsWith("node/") ? 3 :
    id.startsWith("way/") ? 2 :
    id.startsWith("relation/") ? 1 : 0;

  const rankA = rank(idA);
  const rankB = rank(idB);

  if (rankB > rankA) {
    byCoord.set(key, f);
    continue;
  }

  const nameA =
    typeof existing?.properties?.name === "string" &&
    existing.properties.name.trim().length > 0;

  const nameB =
    typeof f?.properties?.name === "string" &&
    f.properties.name.trim().length > 0;

  if (!nameA && nameB) {
    byCoord.set(key, f);
    continue;
  }
}

// ------------------------------------------------------------
// 3) Write cleaned output
// ------------------------------------------------------------
geojson.features = Array.from(byCoord.values());

fs.writeFileSync(output, JSON.stringify(geojson, null, 2));
console.log(
  `✅ Andes ski dataset written: ${geojson.features.length} features → ${output}`
);

// ------------------------------------------------------------
// END
// ------------------------------------------------------------