const fs = require("fs");
const centroid = require("@turf/centroid").default;

// Paths relative to THIS file
const INPUT = "./parking.geojson";
const OUTPUT = "./parking_points.geojson";

// Read input
const raw = fs.readFileSync(INPUT, "utf-8");
const geojson = JSON.parse(raw);

// Convert features
const points = {
  type: "FeatureCollection",
  features: geojson.features.map((feature) => {
    if (feature.geometry?.type === "Point") {
      return feature;
    }

    const point = centroid(feature);
    point.properties = feature.properties || {};
    return point;
  }),
};

// Write output
fs.writeFileSync(OUTPUT, JSON.stringify(points, null, 2));

console.log(`✅ Converted ${geojson.features.length} parking features`);
console.log(`📍 Output written to ${OUTPUT}`);
