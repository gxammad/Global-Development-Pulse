"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Globe2, ArrowRight, Filter } from "lucide-react";
import type { CountrySummary } from "@/types";
import { formatValue } from "@/lib/formatters";

interface CountriesClientProps {
  countries: CountrySummary[];
}

export function CountriesClient({ countries }: CountriesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedIncome, setSelectedIncome] = useState<string>("All");

  const regions = useMemo(() => {
    const list = Array.from(new Set(countries.map((c) => c.region)));
    return ["All", ...list.sort()];
  }, [countries]);

  const incomeGroups = useMemo(() => {
    const list = Array.from(new Set(countries.map((c) => c.income_group)));
    return ["All", ...list.sort()];
  }, [countries]);

  const filteredCountries = useMemo(() => {
    return countries.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.iso3.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.capital.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRegion = selectedRegion === "All" || c.region === selectedRegion;
      const matchIncome = selectedIncome === "All" || c.income_group === selectedIncome;

      return matchSearch && matchRegion && matchIncome;
    });
  }, [countries, searchTerm, selectedRegion, selectedIncome]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search countries by name, ISO code, or capital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent-blue"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Income:</span>
            <select
              value={selectedIncome}
              onChange={(e) => setSelectedIncome(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent-blue"
            >
              {incomeGroups.map((inc) => (
                <option key={inc} value={inc}>
                  {inc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>
          Showing {filteredCountries.length} of {countries.length} tracked economies
        </span>
        {(searchTerm || selectedRegion !== "All" || selectedIncome !== "All") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedRegion("All");
              setSelectedIncome("All");
            }}
            className="text-accent-blue hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCountries.map((c) => {
          const gdp = c.summary_metrics?.gdp;
          const pop = c.summary_metrics?.population;
          const life = c.summary_metrics?.life_expectancy;
          const net = c.summary_metrics?.internet_users;

          return (
            <Link
              key={c.id}
              href={`/countries/${c.id}`}
              className="group rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-accent-blue/50 hover:bg-surface-hover/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" role="img" aria-label={c.name}>
                      {c.flag_emoji}
                    </span>
                    <div>
                      <h2 className="font-bold text-foreground text-base group-hover:text-accent-blue transition-colors">
                        {c.name}
                      </h2>
                      <div className="text-xs text-muted-foreground">
                        {c.capital} • {c.region}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {c.iso3}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-muted-foreground">
                  Income level: <strong className="text-foreground">{c.income_group}</strong>
                </div>

                {/* Key Metrics Grid */}
                <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-border/70 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">GDP ({gdp?.year || "—"})</div>
                    <div className="font-bold text-foreground mt-0.5">
                      {formatValue(gdp?.value, "currency")}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Population</div>
                    <div className="font-bold text-foreground mt-0.5">
                      {formatValue(pop?.value, "number")}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Life Expectancy</div>
                    <div className="font-bold text-foreground mt-0.5">
                      {formatValue(life?.value, "decimal")} years
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Internet Users</div>
                    <div className="font-bold text-foreground mt-0.5">
                      {formatValue(net?.value, "percentage")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">
                  Data Coverage: <strong className="text-foreground">{c.coverage_percent}%</strong>
                </span>
                <span className="flex items-center gap-1 font-semibold text-foreground group-hover:text-accent-blue group-hover:translate-x-0.5 transition-all text-[11px]">
                  Explore Country <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
