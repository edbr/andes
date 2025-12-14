"use client";

import { MAP_STYLES, MapStyleKey } from "@/map/styles";

interface Props {
  value: MapStyleKey;
  onChange: (style: MapStyleKey) => void;
}

export default function MapStyleSelector({ value, onChange }: Props) {
  return (
    <div className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur rounded-md shadow px-2 py-1">
      <select
        className="text-sm border rounded px-2 py-1"
        value={value}
        onChange={(e) => onChange(e.target.value as MapStyleKey)}
      >
        {Object.entries(MAP_STYLES).map(([key, s]) => (
          <option key={key} value={key}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
