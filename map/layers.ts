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
     ROUTES — MAIN LINE
  ------------------------ */
  if (!map.getLayer("osm-routes-line")) {
    map.addLayer({
      id: "osm-routes-line",
      type: "line",
      source: "osm-routes",
      "source-layer": "osm_routes_clean",
      minzoom: 9,
      layout: {
        "line-cap": "square",
        "line-join": "miter",
      },
      paint: {
        "line-color": "#0f172a",
        "line-dasharray": [4, 3],
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          9, 0.8,
          12, 1.4,
          14, 1.8,
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
      cluster: true,
      clusterMaxZoom: 15,
      clusterRadius: 50,
    });
  }

  if (!map.getLayer("volcano-points")) {
    map.addLayer({
      id: "volcano-points",
      type: "symbol",
      source: "mountain-volcano",
      filter: ["==", ["get", "natural"], "volcano"],
      layout: {
        "icon-image": "marker-volcano",
        "icon-size": 1.6,
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
        "icon-image": "marker-mountain",
        "icon-size": 1.6,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
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
      clusterMaxZoom: 8,
      clusterRadius: 30,
    });
  }

  if (!map.getLayer("parking-points")) {
    map.addLayer({
      id: "parking-points",
      type: "symbol",
      source: "parking",
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": "marker-parking",
        "icon-size": 1.4,
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
        "icon-image": "marker-resort",
        "icon-size": 1.6,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
      },
    });
  }
}
