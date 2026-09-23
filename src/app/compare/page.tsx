import React from "react";
import type { Metadata } from "next";
import { getCountryIndex, getIndicatorIndex, getIndicatorData } from "@/lib/data";
import { CompareClient } from "@/components/compare/CompareClient";

export const metadata: Metadata = {
  title: "Cross-Country Comparative Engine | Global Development Pulse",
  description:
    "Compare 2 to 5 global economies simultaneously across 30 verified World Bank indicators with interactive time series and CSV export.",
};

export const revalidate = 3600;

export default async function ComparePage() {
  const [countries, indicators, initialGdpCapita] = await Promise.all([
    getCountryIndex(),
    getIndicatorIndex(),
    getIndicatorData("gdp_per_capita_usd"),
  ]);

  const initialDatasets: Record<string, any> = {};
  if (initialGdpCapita) {
    initialDatasets["gdp_per_capita_usd"] = initialGdpCapita;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Cross-Country Comparative Engine
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Select between 2 and 5 nations to evaluate historical trajectories, growth divergence,
          and structural shifts side-by-side. All time series are normalized and synced to 2000–2024.
        </p>
      </div>

      <CompareClient
        countries={countries}
        indicators={indicators}
        initialDatasets={initialDatasets}
      />
    </div>
  );
}
