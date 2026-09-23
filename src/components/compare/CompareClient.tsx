"use client";

import React, { useState, useMemo } from "react";
import { Download, Plus, X, GitCompare, Info } from "lucide-react";
import type { CountrySummary, IndicatorSummary, IndicatorDataset } from "@/types";
import { InteractiveChart } from "@/components/charts/InteractiveChart";
import { CategoryBadge } from "@/components/ui/Badge";
import { formatValue } from "@/lib/formatters";

interface CompareClientProps {
  countries: CountrySummary[];
  indicators: IndicatorSummary[];
  initialDatasets: Record<string, IndicatorDataset>;
}

const PALETTE = [
  "#2563eb", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#8b5cf6", // purple
];

export function CompareClient({
  countries,
  indicators,
  initialDatasets,
}: CompareClientProps) {
  // Selected 2 to 5 countries
  const [selectedIso3s, setSelectedIso3s] = useState<string[]>(["PAK", "IND", "USA"]);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>("gdp_per_capita_usd");
  const [datasets, setDatasets] = useState<Record<string, IndicatorDataset>>(initialDatasets);
  const [loadingIndicator, setLoadingIndicator] = useState(false);

  // Active indicator metadata
  const currentIndicator = useMemo(() => {
    return indicators.find((i) => i.id === selectedIndicatorId) || indicators[0];
  }, [indicators, selectedIndicatorId]);

  // Current dataset
  const activeDataset = datasets[selectedIndicatorId];

  // Fetch indicator dataset if not present in initial cache
  const handleSelectIndicator = async (indId: string) => {
    setSelectedIndicatorId(indId);
    if (!datasets[indId]) {
      setLoadingIndicator(true);
      try {
        const res = await fetch(`/api/indicators/${indId}`);
        if (res.ok) {
          const data = await res.json();
          setDatasets((prev) => ({ ...prev, [indId]: data }));
        }
      } catch (err) {
        console.error("Failed to load indicator data", err);
      } finally {
        setLoadingIndicator(false);
      }
    }
  };

  const addCountry = (iso3: string) => {
    if (selectedIso3s.length < 5 && !selectedIso3s.includes(iso3)) {
      setSelectedIso3s([...selectedIso3s, iso3]);
    }
  };

  const removeCountry = (iso3: string) => {
    if (selectedIso3s.length > 2) {
      setSelectedIso3s(selectedIso3s.filter((c) => c !== iso3));
    }
  };

  // Build chart series for the active indicator across selected countries
  const chartSeries = useMemo(() => {
    if (!activeDataset) return [];
    return selectedIso3s
      .map((iso3, idx) => {
        const cData = activeDataset.countries[iso3];
        if (!cData) return null;
        return {
          id: iso3,
          name: cData.country.name,
          color: PALETTE[idx % PALETTE.length],
          data: cData.time_series,
        };
      })
      .filter(Boolean) as any[];
  }, [activeDataset, selectedIso3s]);

  // CSV Export utility
  const exportToCSV = () => {
    if (!activeDataset || chartSeries.length === 0) return;

    // Collect all years
    const years = Array.from(
      new Set(chartSeries.flatMap((s) => s.data.map((d: any) => d.year)))
    ).sort((a: any, b: any) => a - b);

    const headers = ["Year", ...chartSeries.map((s) => `"${s.name} (${s.id})"` )];
    const rows = years.map((yr) => {
      const vals = chartSeries.map((s) => {
        const pt = s.data.find((d: any) => d.year === yr);
        return pt?.value !== null && pt?.value !== undefined ? pt.value : "";
      });
      return [yr, ...vals].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `GDP_${currentIndicator.id}_${selectedIso3s.join("-")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const availableCountriesToAdd = countries.filter((c) => !selectedIso3s.includes(c.iso3));

  return (
    <div className="space-y-8">
      {/* Configuration Controls Bar */}
      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-accent-blue" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Cross-Country Comparative Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
              Select 2 to 5 Countries & Any Development Indicator
            </h2>
          </div>

          <button
            onClick={exportToCSV}
            className="self-start lg:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-mono font-medium text-foreground hover:bg-surface-hover transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-accent-cyan" />
            <span>Export Comparison (CSV)</span>
          </button>
        </div>

        {/* Selected Country Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>Active Countries ({selectedIso3s.length}/5):</span>
            {selectedIso3s.length >= 5 && (
              <span className="text-amber-500">Max limit (5) reached</span>
            )}
            {selectedIso3s.length <= 2 && (
              <span className="text-muted-foreground">Min 2 countries required</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIso3s.map((iso3, idx) => {
              const country = countries.find((c) => c.iso3 === iso3);
              const color = PALETTE[idx % PALETTE.length];
              return (
                <div
                  key={iso3}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium shadow-sm"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-base">{country?.flag_emoji}</span>
                  <span className="font-semibold text-foreground">{country?.name}</span>
                  <span className="font-mono text-muted-foreground text-[10px]">({iso3})</span>
                  {selectedIso3s.length > 2 && (
                    <button
                      onClick={() => removeCountry(iso3)}
                      className="ml-1 text-muted-foreground hover:text-foreground p-0.5 rounded"
                      aria-label={`Remove ${country?.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Dropdown to add country if < 5 */}
            {selectedIso3s.length < 5 && availableCountriesToAdd.length > 0 && (
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) addCountry(e.target.value);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-dashed border-border bg-surface text-xs font-mono text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    + Add Country...
                  </option>
                  {availableCountriesToAdd.map((c) => (
                    <option key={c.iso3} value={c.iso3}>
                      {c.name} ({c.iso3})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Indicator Selector */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>Monitored Indicator:</span>
            <CategoryBadge category={currentIndicator.category} size="sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <select
              value={selectedIndicatorId}
              onChange={(e) => handleSelectIndicator(e.target.value)}
              className="col-span-full sm:col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent-blue"
            >
              {indicators.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  [{ind.category}] {ind.name} ({ind.code})
                </option>
              ))}
            </select>

            <div className="text-xs text-muted-foreground flex items-center gap-1 font-mono sm:col-span-1">
              <span>Unit:</span>
              <strong className="text-foreground">{currentIndicator.unit}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Chart Display */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {currentIndicator.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentIndicator.short_description} • Source: {currentIndicator.source}
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Timeframe: 2000 – 2024
          </span>
        </div>

        {loadingIndicator ? (
          <div className="h-[360px] flex items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground font-mono text-xs">
            Loading indicator time series...
          </div>
        ) : (
          <InteractiveChart
            series={chartSeries}
            format={currentIndicator.format}
            unit={currentIndicator.unit}
            defaultRange="20Y"
          />
        )}
      </section>

      {/* Comparative Data Matrix Table */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Comparative Summary Matrix
            </h3>
            <p className="text-xs text-muted-foreground">
              Latest available reporting values and historical extremes across chosen economies.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Country</th>
                <th className="py-2.5 px-4 font-semibold">Region</th>
                <th className="py-2.5 px-4 font-semibold text-right">Latest Value</th>
                <th className="py-2.5 px-4 font-semibold text-right">Latest Year</th>
                <th className="py-2.5 px-4 font-semibold text-right">25-Yr Min</th>
                <th className="py-2.5 px-4 font-semibold text-right">25-Yr Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {selectedIso3s.map((iso3, idx) => {
                const cData = activeDataset?.countries[iso3];
                if (!cData) return null;
                const vals = cData.time_series
                  .map((d) => d.value)
                  .filter((v): v is number => v !== null && !isNaN(v));
                const min = vals.length > 0 ? Math.min(...vals) : null;
                const max = vals.length > 0 ? Math.max(...vals) : null;
                const color = PALETTE[idx % PALETTE.length];

                return (
                  <tr key={iso3} className="hover:bg-surface-hover transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span>{cData.country.flag_emoji}</span>
                      <span>{cData.country.name}</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{cData.country.region}</td>
                    <td className="py-3 px-4 text-right font-bold text-foreground">
                      {formatValue(cData.latest_value, currentIndicator.format, currentIndicator.unit)}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {cData.latest_year || "—"}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {formatValue(min, currentIndicator.format)}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {formatValue(max, currentIndicator.format)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
