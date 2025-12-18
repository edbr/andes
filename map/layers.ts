// map/layers.ts
import maplibregl from "maplibre-gl";

/* ============================================================
   ROUTES + PROTECTED AREAS (WITH LABELS)
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
     PROTECTED AREAS — FILL
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

/* ------------------------
   PROTECTED AREAS — OUTLINE
------------------------ */
if (!map.getLayer("protected-areas-outline")) {
  map.addLayer({
    id: "protected-areas-outline",
    type: "line",
    source: "protected-areas",
    "source-layer": "protected_areas",

    // 👇 start hidden
    layout: {
      visibility: "none",
    },

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
   PROTECTED AREAS — ICONS
------------------------ */
if (!map.getLayer("protected-areas-icons")) {
  map.addLayer({
    id: "protected-areas-icons",
    type: "symbol",
    source: "protected-areas",
    "source-layer": "protected_areas",
    minzoom: 7,
    layout: {
      "symbol-placement": "point",

      "icon-image": [
        "match",
        ["get", "category"],
        "national_park", "marker-protected-national",
        "regional_park", "marker-protected-regional",
        "strict_reserve", "marker-protected-reserve",
        "marker-protected-default"
      ],

      "icon-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        7, 0.55,
        10, 0.8,
        13, 1.05
      ],

      "icon-allow-overlap": false,
      "icon-ignore-placement": false,
      "symbol-sort-key": 1,
      "visibility": "none" // 👈 ADD THIS
    },
    paint: {
      "icon-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        6, 0,
        7, 1
      ]
    }
  });
}

/* ------------------------
   PROTECTED AREAS — LABELS (ONE PER AREA)
------------------------ */
if (!map.getLayer("protected-areas-labels")) {
  map.addLayer({
    id: "protected-areas-labels",
    type: "symbol",
    source: "protected-areas",
    "source-layer": "protected_areas",

    // 👇 show labels only when toggle enables them
    layout: {
      visibility: "none",

      // 🔑 CRITICAL: single placement per feature
      "symbol-placement": "point",

      "text-field": ["get", "name"],
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],

      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        8, 11,
        12, 13,
        14, 15,
      ],

      // 👇 do NOT allow repetition
      "text-allow-overlap": false,
      "text-ignore-placement": false,

      // 👇 single anchor prevents duplication
      "text-anchor": "center",

      // 👇 larger parks win placement
      "symbol-sort-key": [
        "coalesce",
        ["get", "area_km2"],
        0,
      ],
    },

    paint: {
      "text-color": "#064E3B",
      "text-halo-color": "rgba(255,255,255,0.9)",
      "text-halo-width": 1.2,
    },

    // 👇 prevents clutter at low zoom
    minzoom: 3,
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

  /* ------------------------
     ROUTES — LABELS
  ------------------------ */
  if (!map.getLayer("osm-routes-labels")) {
    map.addLayer({
      id: "osm-routes-labels",
      type: "symbol",
      source: "osm-routes",
      "source-layer": "osm_routes_clean",
      minzoom: 11,
      layout: {
        "symbol-placement": "line",
        "text-field": ["coalesce", ["get", "name"], ""],
        "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          11, 10,
          13, 12,
          15, 14,
        ],
        "text-rotation-alignment": "map",
        "text-keep-upright": true,
        "text-allow-overlap": false,
        "text-ignore-placement": false,
        "symbol-sort-key": 0, // lowest priority
      },
      paint: {
        "text-color": "#334155",
        "text-halo-color": "rgba(255,255,255,0.85)",
        "text-halo-width": 1.1,
      },
    });
  }
}


/* ============================================================
   MOUNTAINS + VOLCANOES (CLUSTERED + LABELED)
============================================================ */
export function addMountainVolcanoLayers(map: maplibregl.Map) {
  /* ------------------------
     SOURCE (CLUSTERED)
  ------------------------ */
  if (!map.getSource("mountain-volcano")) {
    map.addSource("mountain-volcano", {
      type: "geojson",
      data: "/data/mountain-volcano-clean.geojson",
      cluster: true,
      clusterMaxZoom: 8, // clusters disappear after this zoom
      clusterRadius: 50,
    });
  }

  /* ------------------------
     VOLCANO ICONS (NO CLUSTERS)
  ------------------------ */
  if (!map.getLayer("volcano-points")) {
    map.addLayer({
      id: "volcano-points",
      type: "symbol",
      source: "mountain-volcano",
      filter: [
        "all",
        ["!", ["has", "point_count"]],
        ["==", ["get", "natural"], "volcano"],
      ],
      layout: {
        "icon-image": "marker-volcano",
        "icon-size": 1.6,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
        "text-optional": true,
      },
    });
  }

  /* ------------------------
     MOUNTAIN ICONS (NO CLUSTERS)
  ------------------------ */
  if (!map.getLayer("mountain-points")) {
    map.addLayer({
      id: "mountain-points",
      type: "symbol",
      source: "mountain-volcano",
      filter: [
        "all",
        ["!", ["has", "point_count"]],
        ["==", ["get", "natural"], "peak"],
      ],
      layout: {
        "icon-image": "marker-mountain",
        "icon-size": 1.6,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
        "text-optional": true,
      },
    });
  }

  /* ------------------------
     MOUNTAIN LABELS (CRITICAL FIX)
  ------------------------ */
  if (!map.getLayer("mountain-labels")) {
    map.addLayer({
      id: "mountain-labels",
      type: "symbol",
      source: "mountain-volcano",
      filter: [
        "all",
        ["!", ["has", "point_count"]],
        ["==", ["get", "natural"], "peak"],
      ],
      minzoom: 9,
      layout: {
        "text-field": ["coalesce", ["get", "name"], ""],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          9, 11,
          12, 13,
          14, 15,
        ],
        "text-offset": [0, 0.85],
        "text-anchor": "top",
        "text-allow-overlap": false,
        "text-ignore-placement": false,
        "symbol-sort-key": 10,
      },
      paint: {
        "text-color": "#374151",
        "text-halo-color": "rgba(255,255,255,0.9)",
        "text-halo-width": 1.25,
        "text-halo-blur": 0.5,
      },
    });
  }
}


/* ============================================================
   PARKING (CLUSTERED + LABELED)
============================================================ */
export function addParkingLayers(map: maplibregl.Map) {
  /* ------------------------
     SOURCE (CLUSTERED)
  ------------------------ */
  if (!map.getSource("parking")) {
    map.addSource("parking", {
      type: "geojson",
      data: "/data/parking_points.geojson",
      cluster: true,
      clusterMaxZoom: 8,
      clusterRadius: 30,
    });
  }

  /* ------------------------
     PARKING ICONS (NO CLUSTERS)
  ------------------------ */
  if (!map.getLayer("parking-points")) {
    map.addLayer({
      id: "parking-points",
      type: "symbol",
      source: "parking",
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": "marker-parking",
        "icon-size": 1.4,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
        "text-optional": true, // critical for label coexistence
      },
    });
  }

  /* ------------------------
     PARKING LABELS
  ------------------------ */
  if (!map.getLayer("parking-labels")) {
    map.addLayer({
      id: "parking-labels",
      type: "symbol",
      source: "parking",
      filter: ["!", ["has", "point_count"]],
      minzoom: 10,
      layout: {
        "text-field": [
          "coalesce",
          ["get", "name"],
          "Parking"
        ],
        "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, 10,
          12, 11,
          14, 12
        ],
        "text-offset": [0, 0.9],
        "text-anchor": "top",
        "text-allow-overlap": false,
        "text-ignore-placement": false,
        "symbol-sort-key": 5, // lower than resorts & mountains
      },
      paint: {
        "text-color": "#374151", // slate-700
        "text-halo-color": "rgba(255,255,255,0.9)",
        "text-halo-width": 1.1,
        "text-halo-blur": 0.4,
      },
    });
  }
}


/* ============================================================
   SKI RESORTS (ICONS + LABELS)
============================================================ */
export function addSkiResortLayers(map: maplibregl.Map) {
  /* ------------------------
     SOURCE
  ------------------------ */
  if (!map.getSource("ski-resorts")) {
    map.addSource("ski-resorts", {
      type: "geojson",
      data: "/data/ski_resorts_clean.geojson",
    });
  }

  /* ------------------------
     RESORT ICONS
  ------------------------ */
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
        "text-optional": true, // critical for label coexistence
      },
    });
  }

  /* ------------------------
     RESORT LABELS
  ------------------------ */
  if (!map.getLayer("ski-resorts-labels")) {
    map.addLayer({
      id: "ski-resorts-labels",
      type: "symbol",
      source: "ski-resorts",
      minzoom: 8,
      layout: {
        "text-field": ["coalesce", ["get", "name"], ""],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8, 11,
          12, 13,
          14, 15,
        ],
        "text-offset": [0, 0.9],
        "text-anchor": "top",
        "text-allow-overlap": false,
        "text-ignore-placement": false,
        "symbol-sort-key": 20, // higher priority than mountains
      },
      paint: {
        "text-color": "#1f2937", // slate-800
        "text-halo-color": "rgba(255,255,255,0.9)",
        "text-halo-width": 1.3,
        "text-halo-blur": 0.5,
      },
    });
  }
}
