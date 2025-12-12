import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const input = path.resolve(__dirname, "osm_routes.geojson");
const output = path.resolve(__dirname, "osm_routes_clean.geojson");

const geojson = JSON.parse(fs.readFileSync(input, "utf-8"));

geojson.features = geojson.features
  .filter((f: any) => {
    const p = f.properties || {};

    // --- Explicit ski routes ---
    if (p.route === "ski") return true;
    if (p["piste:type"] === "skitour") return true;

    // --- Hike / foot access (often skied) ---
    if (
      p.highway === "path" ||
      p.highway === "footway" ||
      p.highway === "track"
    ) {
      return true;
    }

    // --- Mountain hiking scale ---
    if (p.sac_scale) return true;

    return false;
  })
  .map((f: any) => ({
    type: "Feature",
    geometry: f.geometry,
    properties: {
      name: f.properties?.name,
      route: f.properties?.route,
      highway: f.properties?.highway,
      "piste:type": f.properties?.["piste:type"],
      sac_scale: f.properties?.sac_scale,
    },
  }));

fs.writeFileSync(output, JSON.stringify(geojson));
console.log(
  `✅ Routes cleaned: ${geojson.features.length} ski + hike routes`
);
