"use client";

import React, { useState, useMemo } from "react";
import { formatValue } from "@/lib/formatters";
import type { TimeSeriesPoint, FormatType } from "@/types";
import { Table, Eye, EyeOff } from "lucide-react";

export interface ChartSeries {
  id: string;
  name: string;
  color?: string;
  data: TimeSeriesPoint[];
}

interface InteractiveChartProps {
  series: ChartSeries[];
  format?: FormatType;
  unit?: string;
  height?: number;
  showRangeSelector?: boolean;
  defaultRange?: "10Y" | "20Y" | "All";
}

const DEFAULT_COLORS = [
  "#2563eb", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#ec4899", // pink
];

export function InteractiveChart({
  series,
  format = "decimal",
  unit = "",
  height = 360,
  showRangeSelector = true,
  defaultRange = "All",
}: InteractiveChartProps) {
  const [range, setRange] = useState<"5Y" | "10Y" | "20Y" | "All">(defaultRange);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  // Filter series data based on selected range
  const filteredSeries = useMemo(() => {
    const currentMaxYear = 2024;
    let minYear = 2000;
    if (range === "5Y") minYear = currentMaxYear - 4;
    else if (range === "10Y") minYear = currentMaxYear - 9;
    else if (range === "20Y") minYear = currentMaxYear - 19;

    return series.map((s, idx) => ({
      ...s,
      color: s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      data: s.data.filter((d) => d.year >= minYear && d.year <= currentMaxYear),
    }));
  }, [series, range]);

  // Extract all unique years present in any series
  const allYears = useMemo(() => {
    const years = new Set<number>();
    filteredSeries.forEach((s) => {
      s.data.forEach((d) => years.add(d.year));
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [filteredSeries]);

  // Calculate domain min/max
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    filteredSeries.forEach((s) => {
      s.data.forEach((d) => {
        if (d.value !== null && !isNaN(d.value)) {
          if (d.value < min) min = d.value;
          if (d.value > max) max = d.value;
        }
      });
    });

    if (min === Infinity) {
      min = 0;
      max = 100;
    } else if (min === max) {
      min = min > 0 ? 0 : min * 1.2;
      max = max * 1.2 || 1;
    } else {
      // Add subtle padding
      const pad = (max - min) * 0.08;
      max = max + pad;
      min = min < 0 ? min - pad : Math.max(0, min - pad);
    }

    return { minVal: min, maxVal: max };
  }, [filteredSeries]);

  // SVG dimensions
  const svgWidth = 800;
  const paddingLeft = 65;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 40;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const getX = (year: number) => {
    if (allYears.length <= 1) return paddingLeft + plotWidth / 2;
    const minYear = allYears[0];
    const maxYear = allYears[allYears.length - 1];
    const pct = (year - minYear) / (maxYear - minYear || 1);
    return paddingLeft + pct * plotWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    const pct = (val - minVal) / range;
    return height - paddingBottom - pct * plotHeight;
  };

  // Generate 4 horizontal grid lines
  const gridTicks = useMemo(() => {
    const count = 4;
    const ticks = [];
    for (let i = 0; i <= count; i++) {
      const val = minVal + (i / count) * (maxVal - minVal);
      const y = getY(val);
      ticks.push({ val, y });
    }
    return ticks;
  }, [minVal, maxVal, height]);

  // Active tooltip values
  const activeYear = hoveredYear ?? (allYears.length > 0 ? allYears[allYears.length - 1] : null);

  const activePoints = useMemo(() => {
    if (!activeYear) return [];
    return filteredSeries.map((s) => {
      const pt = s.data.find((d) => d.year === activeYear);
      return {
        seriesId: s.id,
        name: s.name,
        color: s.color,
        value: pt?.value ?? null,
      };
    });
  }, [filteredSeries, activeYear]);

  return (
    <div className="w-full rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
      {/* Chart Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Series Legends */}
        <div className="flex flex-wrap items-center gap-3">
          {filteredSeries.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="font-medium text-foreground">{s.name}</span>
            </div>
          ))}
        </div>

        {/* Range and View Options */}
        <div className="flex items-center gap-2">
          {showRangeSelector && (
            <div className="flex items-center rounded-lg border border-border bg-background p-0.5 text-xs font-mono">
              {(["5Y", "10Y", "20Y", "All"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    range === r
                      ? "bg-surface font-semibold text-foreground shadow-sm border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowTable(!showTable)}
            aria-label="Toggle Data Table"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-background text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <Table className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{showTable ? "Chart" : "Table"}</span>
          </button>
        </div>
      </div>

      {showTable ? (
        /* Accessible Data Table View */
        <div className="overflow-x-auto max-h-[380px] border border-border rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-surface border-b border-border text-muted-foreground">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Year</th>
                {filteredSeries.map((s) => (
                  <th key={s.id} className="py-2.5 px-4 font-semibold text-right">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allYears
                .slice()
                .reverse()
                .map((yr) => (
                  <tr key={yr} className="hover:bg-surface-hover transition-colors">
                    <td className="py-2 px-4 font-bold text-foreground">{yr}</td>
                    {filteredSeries.map((s) => {
                      const pt = s.data.find((d) => d.year === yr);
                      return (
                        <td key={s.id} className="py-2 px-4 text-right text-muted-foreground">
                          {formatValue(pt?.value, format, unit)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Responsive Interactive SVG */
        <div className="relative w-full">
          <svg
            viewBox={`0 0 ${svgWidth} ${height}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoveredYear(null)}
          >
            {/* Horizontal Grid lines */}
            {gridTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={tick.y}
                  x2={svgWidth - paddingRight}
                  y2={tick.y}
                  stroke="currentColor"
                  className="text-border"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px] font-mono"
                >
                  {formatValue(tick.val, format)}
                </text>
              </g>
            ))}

            {/* X Axis years */}
            {allYears
              .filter((_, i) => i === 0 || i === allYears.length - 1 || i % Math.ceil(allYears.length / 6) === 0)
              .map((yr) => {
                const x = getX(yr);
                return (
                  <text
                    key={yr}
                    x={x}
                    y={height - paddingBottom + 20}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[11px] font-mono"
                  >
                    {yr}
                  </text>
                );
              })}

            {/* Series Paths */}
            {filteredSeries.map((s) => {
              const validPts = s.data.filter((d) => d.value !== null) as { year: number; value: number }[];
              if (validPts.length < 2) return null;

              const pathSegments = validPts.map((d) => `${getX(d.year).toFixed(1)},${getY(d.value).toFixed(1)}`);
              const dPath = `M ${pathSegments.join(" L ")}`;

              return (
                <g key={s.id}>
                  <path
                    d={dPath}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {validPts.map((pt) => {
                    const isHovered = pt.year === activeYear;
                    return (
                      <circle
                        key={pt.year}
                        cx={getX(pt.year)}
                        cy={getY(pt.value)}
                        r={isHovered ? 4.5 : 2.5}
                        fill={s.color}
                        stroke="var(--surface)"
                        strokeWidth={isHovered ? 2 : 1}
                        className="transition-all duration-150"
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Hover Crosshair Line */}
            {activeYear && (
              <line
                x1={getX(activeYear)}
                y1={paddingTop}
                x2={getX(activeYear)}
                y2={height - paddingBottom}
                stroke="currentColor"
                className="text-muted-foreground/60"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            )}

            {/* Invisible Hover Hitboxes across years */}
            {allYears.map((yr) => {
              const x = getX(yr);
              const colWidth = plotWidth / (allYears.length || 1);
              return (
                <rect
                  key={yr}
                  x={x - colWidth / 2}
                  y={paddingTop}
                  width={colWidth}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredYear(yr)}
                />
              );
            })}
          </svg>

          {/* Active Data Readout Bar under Chart */}
          <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Inspecting Year:</span>
              <span className="font-bold text-foreground text-sm px-2 py-0.5 rounded bg-muted">
                {activeYear || "—"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {activePoints.map((pt) => (
                <div key={pt.seriesId} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pt.color }} />
                  <span className="text-muted-foreground">{pt.name}:</span>
                  <span className="font-bold text-foreground">
                    {formatValue(pt.value, format, unit)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
