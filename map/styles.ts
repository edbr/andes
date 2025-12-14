// map/styles.ts

export const MAP_STYLES = {
  topo: {
    label: "Topo",
    url: (key: string) =>
      `https://api.maptiler.com/maps/topo/style.json?key=${key}`,
  },
  light: {
    label: "Light",
    url: (key: string) =>
      `https://api.maptiler.com/maps/streets/style.json?key=${key}`,
  },
  satellite: {
    label: "Satellite",
    url: (key: string) =>
      `https://api.maptiler.com/maps/satellite/style.json?key=${key}`,
  },
} as const;

/**
 * ✅ Union type: "topo" | "light" | "satellite"
 */
export type MapStyleKey = keyof typeof MAP_STYLES;
