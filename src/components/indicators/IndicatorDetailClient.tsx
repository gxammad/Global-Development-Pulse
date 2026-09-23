"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Info,
  GitCompare,
  TrendingUp,
  Award,
  Layers,
} from "lucide-react";
import type { IndicatorDataset } from "@/types";
import { InteractiveChart } from "@/components/charts/InteractiveChart";
import { CategoryBadge } from "@/components/ui/Badge";
import { formatValue } from "@/lib/formatters";

interface IndicatorDetailClientProps {
  data: IndicatorDataset;
}

export function IndicatorDetailClient({ data }: IndicatorDetailClientProps) {
  const { indicator, countries } = data;

  // Initial highlighted countries on the chart
  const [selectedIso3s, setSelectedIso3s] = useState<string[]>([
    "PAK",
    "IND",
    "USA",
    "GBR",
    "CHN",
  ]);

  // Sort countries by latest value descending for ranking table
  const countryRankings = useMemo(() => {
    return Object.entries(countries)
      .map(([iso3, c]) => ({
        iso3,
        country: c.country,
        latest_value: c.latest_value,
        latest_year: c.latest_year,
        time_series: c.time_series,
      }))
      .sort((a, b) => {
        if (a.latest_value === null) return 1;
        if (b.latest_value === null) return -1;
        return (b.latest_value || 0) - (a.latest_value || 0);
      });
  }, [countries]);

  // Build chart series for currently selected countries
  const chartSeries = useMemo(() => {
    return selectedIso3s
      .map((iso3) => {
        const c = countries[iso3];
        if (!c) return null;
        return {
          id: iso3,
          name: c.country.name,
          data: c.time_series,
        };
      })
      .filter(Boolean) as any[];
  }, [countries, selectedIso3s]);

  const toggleCountrySelection = (iso3: string) => {
    if (selectedIso3s.includes(iso3)) {
      if (selectedIso3s.length > 1) {
        setSelectedIso3s(selectedIso3s.filter((c) => c !== iso3));
      }
    } else {
      setSelectedIso3s([...selectedIso3s, iso3]);
    }
  };

  return (
    <div className="space-y-10">
      {/* Back button */}
      <div className="flex items-center justify-between text-xs">
        <Link
          href="/indicators"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Indicators Registry</span>
        </Link>
        <Link
          href="/compare"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-border bg-surface text-foreground hover:bg-surface-hover transition-colors font-mono"
        >
          <GitCompare className="h-3.5 w-3.5 text-accent-blue" />
          <span>Launch Multi-Indicator Compare</span>
        </Link>
      </div>

      {/* Indicator Header */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <CategoryBadge category={indicator.category} />
          <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {indicator.code}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            Unit: <strong className="text-foreground">{indicator.unit}</strong>
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {indicator.name}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            {indicator.short_description}
          </p>
        </div>

        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Authoritative Source:</span>
            <span>{indicator.source}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>Descriptive indicator: values reflect structural conditions without normative bias.</span>
          </div>
        </div>
      </div>

      {/* Cross-Country Historical Comparison Chart */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Cross-Country Historical Trajectory (2000–2024)
            </h2>
            <p className="text-xs text-muted-foreground">
              Toggle country pills below to add or remove nations from the visualization.
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Active: {selectedIso3s.length} countries
          </span>
        </div>

        {/* Toggle Pills */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border bg-surface">
          {countryRankings.map((c) => {
            const isSelected = selectedIso3s.includes(c.iso3);
            return (
              <button
                key={c.iso3}
                onClick={() => toggleCountrySelection(c.iso3)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-foreground text-background font-semibold shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-surface-hover border border-border"
                }`}
              >
                <span>{c.country.flag_emoji}</span>
                <span>{c.country.name}</span>
              </button>
            );
          })}
        </div>

        <InteractiveChart
          series={chartSeries}
          format={indicator.format}
          unit={indicator.unit}
          defaultRange="All"
        />
      </section>

      {/* Global Rankings & Availability Table */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Cross-Country Distribution & Latest Available Values
            </h3>
            <p className="text-xs text-muted-foreground">
              Sorted by latest reported observation from World Bank Open Data.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="py-2.5 px-3 font-semibold w-12">#</th>
                <th className="py-2.5 px-4 font-semibold">Country</th>
                <th className="py-2.5 px-4 font-semibold">Region</th>
                <th className="py-2.5 px-4 font-semibold">Income Group</th>
                <th className="py-2.5 px-4 font-semibold text-right">Latest Observation</th>
                <th className="py-2.5 px-4 font-semibold text-right">Year</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {countryRankings.map((item, idx) => (
                <tr key={item.iso3} className="hover:bg-surface-hover transition-colors">
                  <td className="py-3 px-3 text-muted-foreground font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                    <span className="text-base">{item.country.flag_emoji}</span>
                    <span>{item.country.name}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{item.country.region}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.country.income_group}</td>
                  <td className="py-3 px-4 text-right font-bold text-foreground text-sm">
                    {formatValue(item.latest_value, indicator.format, indicator.unit)}
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">
                    {item.latest_year || "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/countries/${item.country.id}`}
                      className="text-accent-blue hover:underline font-sans text-xs"
                    >
                      Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
