"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { closeAllMapPanels } from "@/lib/mapUi";

interface Props {
  onFilterChange: (filters: any) => void;
  onToggleRoutes: (visible: boolean) => void;
  onToggleSkiOnly: (skiOnly: boolean) => void;
  onToggleSkiResorts: (visible: boolean) => void;
  onToggleVolcanoes: (visible: boolean) => void;
  onToggleMountains: (visible: boolean) => void;
  onToggleParking: (visible: boolean) => void;
  onToggleProtectedAreas: (visible: boolean) => void;
}

export default function SidebarFilters(props: Props) {
  const {
    onFilterChange,
    onToggleRoutes,
    onToggleSkiOnly,
    onToggleSkiResorts,
    onToggleVolcanoes,
    onToggleMountains,
    onToggleParking,
    onToggleProtectedAreas,
  } = props;

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const [elevation, setElevation] = useState<[number, number]>([0, 6000]);

  const [layers, setLayers] = useState({
    routes: true,
    skiResorts: false,
    volcanoes: false,
    mountains: false,
    parking: false,
    protectedAreas: false,
  });

  // ------------------------------------------------------------
  // Close panel (idempotent + animated)
  // ------------------------------------------------------------
  function closePanel() {
    if (!open || closing) return;

    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      closeTimer.current = null;
    }, 200);
  }

  // ------------------------------------------------------------
  // External close signal (map click, other panels)
  // ------------------------------------------------------------
  useEffect(() => {
    function handleGlobalClose() {
      closePanel();
    }

    document.addEventListener("close-map-panels", handleGlobalClose);
    return () => {
      document.removeEventListener("close-map-panels", handleGlobalClose);
    };
  }, [open, closing]);

  // ------------------------------------------------------------
  // Layer toggle helper
  // ------------------------------------------------------------
  function toggleLayer<K extends keyof typeof layers>(
    key: K,
    value: boolean,
    callback: (v: boolean) => void
  ) {
    setLayers((prev) => ({ ...prev, [key]: value }));
    callback(value);
  }

  return (
    <>
      {/* ======================================================
          FAB — ALWAYS VISIBLE
      ====================================================== */}
        <button
        onClick={() => {
        closeAllMapPanels();
        setOpen(true);
      }}
        className="map-ui-fab"
        aria-label="Open map filters"
      >
        <SlidersHorizontal className="w-5 h-5 text-gray-700" />
      </button>

      {/* ======================================================
          BOTTOM SHEET
      ====================================================== */}
      {open && (
        <div className="map-ui-sheet">
          {/* Backdrop (allows map close, but not block FABs) */}
          <div className="map-ui-backdrop" onClick={closePanel} />

          {/* Panel */}
          <div className={`map-ui-panel ${closing ? "closing" : ""}`}>
            {/* Header */}
            <div className="map-ui-header">
              <div className="map-ui-grabber" />
              <h3 className="map-ui-title">Filters</h3>

              <button
                onClick={closePanel}
                className="map-ui-close-btn"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Card className="border-0 shadow-none p-0 space-y-2 bg-transparent">
              {/* Elevation */}
              <div className="map-ui-section">
                <Label className="map-ui-section-label py-2">
                  Elevation (m)
                </Label>

                <Slider
                  min={0}
                  max={6000}
                  step={100}
                  value={elevation}
                  onValueChange={(v) => {
                    setElevation(v as [number, number]);
                    onFilterChange({ elevation: v });
                  }}
                />

                <p className="text-xs text-muted-foreground mt-1 py-2">
                  {elevation[0]}m – {elevation[1]}m
                </p>
              </div>

              {/* Layers */}
              <div className="pt-2 border-t space-y-4">
                <ToggleRow
                  label="Protected Areas"
                  checked={layers.protectedAreas}
                  onChange={(v) =>
                    toggleLayer("protectedAreas", v, onToggleProtectedAreas)
                  }
                />

                <ToggleRow
                  label="Volcanoes"
                  checked={layers.volcanoes}
                  onChange={(v) =>
                    toggleLayer("volcanoes", v, onToggleVolcanoes)
                  }
                />

                <ToggleRow
                  label="Mountains"
                  checked={layers.mountains}
                  onChange={(v) =>
                    toggleLayer("mountains", v, onToggleMountains)
                  }
                />

                <ToggleRow
                  label="Ski Resorts"
                  checked={layers.skiResorts}
                  onChange={(v) =>
                    toggleLayer("skiResorts", v, onToggleSkiResorts)
                  }
                />

                <ToggleRow
                  label="Parking"
                  checked={layers.parking}
                  onChange={(v) =>
                    toggleLayer("parking", v, onToggleParking)
                  }
                />

                <ToggleRow
                  label="Routes"
                  checked={layers.routes}
                  onChange={(v) => {
                    toggleLayer("routes", v, onToggleRoutes);
                    if (!v) onToggleSkiOnly(false);
                  }}
                />
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

/* --------------------------------
   Toggle Row
-------------------------------- */

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="map-ui-toggle-row">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
