// map/layers.ts
import maplibregl from "maplibre-gl";

export function addRouteLayers(map: maplibregl.Map) {
  map.addSource("osm-routes", {
    type: "vector",
    url: "pmtiles:///data/osm_routes.pmtiles",
  });

  map.addLayer({
    id: "osm-routes-casing",
    type: "line",
    source: "osm-routes",
    "source-layer": "osm_routes_clean",
    paint: {
      "line-color": "rgba(0,0,0,0.35)",
      "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.6, 11, 3.6],
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0.2, 11, 0.7],
    },
  });

  map.addLayer({
    id: "osm-routes-line",
    type: "line",
    source: "osm-routes",
    "source-layer": "osm_routes_clean",
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": [
        "case",
        ["any",
          ["==", ["get", "route"], "ski"],
          ["==", ["get", "piste:type"], "skitour"],
        ],
        "#4FC3F7",
        ["has", "sac_scale"],
        "#5A5A5A",
        ["any",
          ["==", ["get", "highway"], "footway"],
          ["==", ["get", "highway"], "residential"],
          ["==", ["get", "highway"], "service"],
        ],
        "#B0B8C0",
        "#7A8CA0",
      ],
      "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.4, 11, 2.8],
      "line-opacity": ["case", ["has", "sac_scale"], 0.95, 0.5],
    },
  });
}

export function addMountainVolcanoLayers(map: maplibregl.Map) {
  map.addSource("mountain-volcano", {
    type: "geojson",
    data: "/data/mountain-volcano-clean.geojson",
  });

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

export function addParkingLayers(map: maplibregl.Map) {
  map.addSource("parking", {
    type: "geojson",
    data: "/data/parking_points.geojson",
    cluster: true,
    clusterMaxZoom: 11,
    clusterRadius: 50,
  });

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

export function addSkiResortLayers(map: maplibregl.Map) {
  map.addSource("ski-resorts", {
    type: "geojson",
    data: "/data/ski_resorts_clean.geojson",
  });

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
