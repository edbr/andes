// map/layers.ts
import maplibregl from "maplibre-gl";

/* ============================================================
   ROUTES + PROTECTED AREAS
============================================================ */
export function addRouteLayers(map: maplibregl.Map) {
  /* ------------------------
     SOURCES
  ------------------------ */
  if (!map.getSource("osm-routes")) {
    map.addSource("osm-routes", {
      type: "vector",
      url: "pmtiles:///data/osm_routes.pmtiles",
    });
  }

  if (!map.getSource("protected-areas")) {
    map.addSource("protected-areas", {
      type: "vector",
      url: "pmtiles:///data/andes_protected.pmtiles",
    });
  }

  /* ------------------------
     PROTECTED AREAS (BELOW ROUTES)
  ------------------------ */
  if (!map.getLayer("protected-areas-fill")) {
    map.addLayer({
      id: "protected-areas-fill",
      type: "fill",
      source: "protected-areas",
      "source-layer": "protected_areas",
      paint: {
        "fill-color": [
          "match",
          ["get", "category"],
          "national_park", "#2E8B57",
          "regional_park", "#6B8E23",
          "strict_reserve", "#1E6F5C",
          "#9CA3AF",
        ],
        "fill-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4, 0.15,
          8, 0.35,
          12, 0.45,
        ],
      },
    });
  }

  if (!map.getLayer("protected-areas-outline")) {
    map.addLayer({
      id: "protected-areas-outline",
      type: "line",
      source: "protected-areas",
      "source-layer": "protected_areas",
      paint: {
        "line-color": "#065F46",
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          6, 0.6,
          10, 1.6,
        ],
        "line-opacity": 0.6,
      },
    });
  }

  /* ------------------------
     ROUTES — CASING
  ------------------------ */
  if (!map.getLayer("osm-routes-casing")) {
    map.addLayer({
      id: "osm-routes-casing",
      type: "line",
      source: "osm-routes",
      "source-layer": "osm_routes_clean",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        // subtle halo to improve contrast on snow / imagery
        "line-color": "rgba(0,0,0,0.25)",
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          6, 1.2,
          11, 4.5,
          14, 6.5,
        ],
        "line-opacity": 0.4,
      },
    });
  }

  /* ------------------------
     ROUTES — MAIN LINE (DASHED)
  ------------------------ */
  if (!map.getLayer("osm-routes-line")) {
    map.addLayer({
      id: "osm-routes-line",
      type: "line",
      source: "osm-routes",
      "source-layer": "osm_routes_clean",
      minzoom: 9, // 👈 key line
      layout: {
        "line-cap": "square",
        "line-join": "miter",
      },
      paint: {
        // soft near-black
        "line-color": "#0f172a",

        // ✅ VALID: constant dash pattern
        "line-dasharray": [4, 3],

        // ✅ Zoom-scaled thickness
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          1, 0.04,
          11, 1,
          14, 1,
        ],

        "line-opacity": 1,
      },
    });
  }
}

/* ============================================================
   MOUNTAINS + VOLCANOES
============================================================ */
export function addMountainVolcanoLayers(map: maplibregl.Map) {
  if (!map.getSource("mountain-volcano")) {
    map.addSource("mountain-volcano", {
      type: "geojson",
      data: "/data/mountain-volcano-clean.geojson",
    });
  }

  if (!map.getLayer("volcano-points")) {
    map.addLayer({
      id: "volcano-points",
      type: "symbol",
      source: "mountain-volcano",
      filter: ["==", ["get", "natural"], "volcano"],
      layout: {
        "icon-image": "volcano-icon",
        "icon-size": 0.9,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
      },
    });
  }

  if (!map.getLayer("mountain-points")) {
    map.addLayer({
      id: "mountain-points",
      type: "symbol",
      source: "mountain-volcano",
      filter: ["==", ["get", "natural"], "peak"],
      layout: {
        "icon-image": "mountain-icon",
        "icon-size": 0.85,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
      },
      paint: {
        "icon-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0, 8, 1],
      },
    });
  }
}

/* ============================================================
   PARKING
============================================================ */
export function addParkingLayers(map: maplibregl.Map) {
  if (!map.getSource("parking")) {
    map.addSource("parking", {
      type: "geojson",
      data: "/data/parking_points.geojson",
      cluster: true,
      clusterMaxZoom: 11,
      clusterRadius: 50,
    });
  }

  if (!map.getLayer("parking-points")) {
    map.addLayer({
      id: "parking-points",
      type: "symbol",
      source: "parking",
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": "parking-icon",
        "icon-size": ["interpolate", ["linear"], ["zoom"], 6, 0.2, 10, 0.45],
        "icon-allow-overlap": true,
      },
    });
  }
}

/* ============================================================
   SKI RESORTS
============================================================ */
export function addSkiResortLayers(map: maplibregl.Map) {
  if (!map.getSource("ski-resorts")) {
    map.addSource("ski-resorts", {
      type: "geojson",
      data: "/data/ski_resorts_clean.geojson",
    });
  }

  if (!map.getLayer("ski-resorts-points")) {
    map.addLayer({
      id: "ski-resorts-points",
      type: "symbol",
      source: "ski-resorts",
      layout: {
        "icon-image": "ski-icon",
        "icon-size": 0.9,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
      },
    });
  }
}
