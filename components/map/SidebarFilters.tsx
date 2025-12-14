"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Props {
  onFilterChange: (filters: any) => void;
  onToggleRoutes: (visible: boolean) => void;
  onToggleSkiOnly: (skiOnly: boolean) => void;
  onToggleSkiResorts: (visible: boolean) => void;
  onToggleVolcanoes: (visible: boolean) => void;
  onToggleMountains: (visible: boolean) => void; // ✅ NEW
  onToggleParking: (visible: boolean) => void; // ✅ USED
  
}

export default function SidebarFilters({
  onFilterChange,
  onToggleRoutes,
  onToggleSkiOnly,
  onToggleSkiResorts,
  onToggleVolcanoes,
  onToggleMountains,
  onToggleParking,
}: Props) {
  const [elevation, setElevation] = useState<[number, number]>([0, 6000]);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [season, setSeason] = useState<string | null>(null);

  const [routesVisible, setRoutesVisible] = useState(true);
  const [skiOnly, setSkiOnly] = useState(false);
  const [skiResortsVisible, setSkiResortsVisible] = useState(false);
  const [volcanoesVisible, setVolcanoesVisible] = useState(false);
  const [mountainsVisible, setMountainsVisible] = useState(false); // ✅ NEW
  const [parkingVisible, setParkingVisible] = useState(false); // ✅ NEW

  function updateFilters(partial: any) {
    onFilterChange({
      elevation,
      difficulty,
      season,
      ...partial,
    });
  }

  return (
    <div className="absolute left-4 top-4 z-50 w-64">
      <Card className="p-4 space-y-6 shadow-lg bg-white/90 backdrop-blur">
        {/* Elevation */}
        <div>
          <Label className="text-sm font-medium">Elevation (m)</Label>
          <Slider
            min={0}
            max={6000}
            step={100}
            value={elevation}
            onValueChange={(v) => {
              setElevation(v as [number, number]);
              updateFilters({ elevation: v });
            }}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {elevation[0]}m – {elevation[1]}m
          </p>
        </div>

        {/* Difficulty */}
        <div>
          <Label className="text-sm font-medium">Difficulty</Label>
          <Select
            onValueChange={(v) => {
              setDifficulty(v);
              updateFilters({ difficulty: v });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Season */}
        <div>
          <Label className="text-sm font-medium">Season</Label>
          <Select
            onValueChange={(v) => {
              setSeason(v);
              updateFilters({ season: v });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any season" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="winter">Winter</SelectItem>
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="fall">Fall</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Layers */}
        <div className="pt-2 border-t space-y-4">
          {/* Volcanoes */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Show Volcanoes</Label>
            <Switch
              checked={volcanoesVisible}
              onCheckedChange={(checked) => {
                setVolcanoesVisible(checked);
                onToggleVolcanoes(checked);
              }}
            />
          </div>

          {/* Ski Resorts */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Show Ski Resorts</Label>
            <Switch
              checked={skiResortsVisible}
              onCheckedChange={(checked) => {
                setSkiResortsVisible(checked);
                onToggleSkiResorts(checked);
              }}
            />
          </div>

          {/* Mountains */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Show Mountains</Label>
          <Switch
            checked={mountainsVisible}
            onCheckedChange={(checked) => {
              setMountainsVisible(checked);
              onToggleMountains(checked);
            }}
          />
        </div>

          {/* Parking */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Show Parking</Label>
            <Switch
              checked={parkingVisible}
              onCheckedChange={(checked) => {
                setParkingVisible(checked);
                onToggleParking(checked);
              }}
            />
          </div>

          {/* Routes */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Show Routes</Label>
            <Switch
              checked={routesVisible}
              onCheckedChange={(checked) => {
                setRoutesVisible(checked);
                onToggleRoutes(checked);

                if (!checked) {
                  setSkiOnly(false);
                  onToggleSkiOnly(false);
                }
              }}
            />
          </div>

          {/* Ski Routes Only */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Ski Routes Only</Label>
            <Switch
              checked={skiOnly}
              disabled={!routesVisible}
              onCheckedChange={(checked) => {
                setSkiOnly(checked);
                onToggleSkiOnly(checked);
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
