// map/icons.ts
import maplibregl from "maplibre-gl";

/**
 * Marker icons (PNG)
 * These are rendered INSIDE MapLibre (canvas)
 * Sizes exported: 32 / 48 / 64 → we standardize on 48
 */
const MARKER_ICONS = [
  { id: "marker-mountain", url: "/icons/markers/marker-mountain-48.png" },
  { id: "marker-parking", url: "/icons/markers/marker-parking-48.png" },
  { id: "marker-resort", url: "/icons/markers/marker-resort-48.png" },
  { id: "marker-route", url: "/icons/markers/marker-route-48.png" },
  { id: "marker-volcano", url: "/icons/markers/marker-volcano-48.png" },
] as const;

/**
 * Load all map marker images into MapLibre
 * Safe to call multiple times (style switches, reloads)
 */
export async function loadIcons(map: maplibregl.Map) {
  await Promise.all(
    MARKER_ICONS.map(async ({ id, url }) => {
      if (map.hasImage(id)) return;

      const res = await map.loadImage(url);

      map.addImage(id, res.data, {
        pixelRatio: 2, // correct for 48px PNGs on retina
      });
    })
  );
}
