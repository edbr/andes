// map/icons.ts
import maplibregl from "maplibre-gl";

export async function loadIcons(map: maplibregl.Map) {
  const icons = [
    ["volcano-icon", "/icons/volcano.png"],
    ["mountain-icon", "/icons/mountain.png"],
    ["ski-icon", "/icons/ski.png"],
    ["parking-icon", "/icons/parking.png"],
  ] as const;

  await Promise.all(
    icons.map(async ([id, url]) => {
      if (map.hasImage(id)) return;
      const res = await map.loadImage(url);
      map.addImage(id, res.data, { pixelRatio: 2 });
    })
  );
}
