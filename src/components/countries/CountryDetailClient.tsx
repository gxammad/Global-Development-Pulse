"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe2,
  Calendar,
  Layers,
  ArrowLeft,
  GitCompare,
  TrendingUp,
} from "lucide-react";
import type { CountryDataset, IndicatorCategory } from "@/types";
import { InteractiveChart } from "@/components/charts/InteractiveChart";
import { StatCard } from "@/components/ui/StatCard";
import { CategoryBadge } from "@/components/ui/Badge";
import { formatValue } from "@/lib/formatters";

interface CountryDetailClientProps {
  data: CountryDataset;
}

const CATEGORIES: IndicatorCategory[] = [
  "Economic",
  "Population",
  "Employment",
  "Education",
  "Digital",
  "Environment",
];

export function CountryDetailClient({ data }: CountryDetailClientProps) {
  const { country, indicators } = data;
  const [activeCategory, setActiveCategory] = useState<IndicatorCategory>("Economic");
  const [selectedChartIndicator, setSelectedChartIndicator] = useState<string>("gdp_current_usd");

  // Filter indicators for the active category
  const categoryIndicators = Object.entries(indicators).filter(
    ([_, ind]) => ind.metadata.category === activeCategory
  );

  // The active indicator for chart display
  const currentChartInd = indicators[selectedChartIndicator] || categoryIndicators[0]?.[1];

  const chartSeries = currentChartInd
    ? [
        {
          id: currentChartInd.metadata.id,
          name: `${country.name} - ${currentChartInd.metadata.name}`,
          color: "#2563eb",
          data: currentChartInd.time_series,
        },
      ]
    : [];

  return (
    <div className="space-y-10">
      {/* Back button and quick navigation */}
      <div className="flex items-center justify-between text-xs">
        <Link
          href="/countries"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Countries Directory</span>
        </Link>
        <Link
          href={`/compare?country1=${country.iso3}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-border bg-surface text-foreground hover:bg-surface-hover transition-colors font-mono"
        >
          <GitCompare className="h-3.5 w-3.5 text-accent-blue" />
          <span>Compare {country.name}</span>
        </Link>
      </div>

      {/* Country Header */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <span className="text-4xl sm:text-5xl" role="img" aria-label={country.name}>
              {country.flag_emoji}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {country.name}
                </h1>
                <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {country.iso3} / {country.iso2}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Capital: <strong className="text-foreground font-medium">{country.capital}</strong> • Region:{" "}
                <strong className="text-foreground font-medium">{country.region}</strong> • Income Group:{" "}
                <strong className="text-foreground font-medium">{country.income_group}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground pt-4 md:pt-0 border-t md:border-t-0 border-border">
            <div>
              <span className="text-[10px] uppercase text-muted-foreground/80 block">Indicators Monitored</span>
              <strong className="text-foreground text-sm">
                {Object.keys(indicators).length} / 30
              </strong>
            </div>
            <div className="border-l border-border pl-4">
              <span className="text-[10px] uppercase text-muted-foreground/80 block">Data Source</span>
              <span className="text-foreground">World Bank Open Data</span>
            </div>
            <div className="border-l border-border pl-4">
              <span className="text-[10px] uppercase text-muted-foreground/80 block">Time Span</span>
              <span className="text-foreground">2000 – 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto space-x-2 py-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  // Auto-select first indicator in newly chosen category
                  const firstInCat = Object.entries(indicators).find(
                    ([_, ind]) => ind.metadata.category === cat
                  );
                  if (firstInCat) {
                    setSelectedChartIndicator(firstInCat[0]);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-surface text-foreground font-bold border border-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <CategoryBadge category={cat} size="sm" />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Metric Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {activeCategory} Indicators ({categoryIndicators.length})
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            Click any indicator card to visualize time series below
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryIndicators.map(([id, ind]) => {
            const isSelected = selectedChartIndicator === id;
            return (
              <div
                key={id}
                onClick={() => setSelectedChartIndicator(id)}
                className={`cursor-pointer transition-all rounded-xl ${
                  isSelected ? "ring-2 ring-accent-blue" : ""
                }`}
              >
                <StatCard
                  title={ind.metadata.name}
                  value={ind.latest_value}
                  year={ind.latest_year}
                  unit={ind.metadata.unit}
                  format={ind.metadata.format}
                  subtitle={`Coverage: ${ind.coverage_percent}%`}
                  sparklineData={ind.time_series}
                  sparklineColor={isSelected ? "#2563eb" : "#64748b"}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Time Series Chart Section */}
      {currentChartInd && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-accent-blue">
                  Historical Trajectory
                </span>
                <span className="text-border">|</span>
                <span className="text-xs font-mono text-muted-foreground">
                  World Bank Code: {currentChartInd.metadata.code}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground mt-1">
                {currentChartInd.metadata.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentChartInd.metadata.short_description}
              </p>
            </div>

            <Link
              href={`/indicators/${currentChartInd.metadata.id}`}
              className="text-xs font-medium text-accent-blue hover:underline flex items-center gap-1 font-mono shrink-0"
            >
              <span>Compare globally across 15 nations</span>
            </Link>
          </div>

          <InteractiveChart
            series={chartSeries}
            format={currentChartInd.metadata.format}
            unit={currentChartInd.metadata.unit}
            defaultRange="All"
          />
        </section>
      )}

      {/* Data Availability Breakdown Table */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">
          Indicator Registry Audit for {country.name}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Indicator Name</th>
                <th className="py-2.5 px-3 font-semibold">Code</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold text-right">Latest Value</th>
                <th className="py-2.5 px-3 font-semibold text-right">Year</th>
                <th className="py-2.5 px-3 font-semibold text-right">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Object.entries(indicators).map(([id, ind]) => (
                <tr key={id} className="hover:bg-surface-hover transition-colors">
                  <td className="py-2.5 px-3 font-medium text-foreground">
                    <Link
                      href={`/indicators/${id}`}
                      className="hover:text-accent-blue hover:underline"
                    >
                      {ind.metadata.name}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{ind.metadata.code}</td>
                  <td className="py-2.5 px-3">
                    <CategoryBadge category={ind.metadata.category} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-foreground">
                    {formatValue(ind.latest_value, ind.metadata.format, ind.metadata.unit)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground">
                    {ind.latest_year || "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                        ind.coverage_percent > 80
                          ? "bg-emerald-500/10 text-emerald-500"
                          : ind.coverage_percent > 40
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {ind.coverage_percent}%
                    </span>
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
