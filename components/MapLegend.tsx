// components/MapLegend.tsx
"use client";

export default function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-50 bg-white/90 backdrop-blur-md shadow-xl rounded-lg p-4 w-64 text-sm border border-gray-200 pointer-events-auto">
      <h3 className="font-semibold mb-3 text-gray-800 tracking-tight">
        Map Legend
      </h3>

      {/* =========================
          POINT FEATURES
      ========================= */}
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
          Points
        </p>

        <LegendRow
          icon="/icons/ski.png"
          label="Ski Resort / Base Area"
          size="w-6 h-6"
        />

        <LegendRow
          icon="/icons/volcano.png"
          label="Volcano (Ski Objective)"
          size="w-6 h-6"
        />

        <LegendRow
          icon="/icons/mountain.png"
          label="Major Mountain / Peak"
          size="w-5 h-5"
        />

        <LegendRow
          icon="/icons/parking.png"
          label="Parking / Trailhead"
          size="w-4 h-4"
        />
      </div>

      {/* =========================
          LINE FEATURES
      ========================= */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
          Routes
        </p>

        <LegendLine color="#1976D2" label="Route / Trail" />

        <LegendLine color="#00A8A8" label="Ski Tour / Skin Track" />

        <LegendLine color="#D32F2F" label="Serious / Alpine Terrain" />
      </div>
    </div>
  );
}

/* --------------------------------
   Small helper components
-------------------------------- */

function LegendRow({
  icon,
  label,
  size,
}: {
  icon: string;
  label: string;
  size: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <img
        src={icon}
        alt={label}
        className={`${size} object-contain`}
      />
      <span className="text-gray-800">{label}</span>
    </div>
  );
}

function LegendLine({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span
        className="inline-block w-6 h-[3px] rounded"
        style={{ backgroundColor: color }}
      />
      <span className="text-gray-800">{label}</span>
    </div>
  );
}
