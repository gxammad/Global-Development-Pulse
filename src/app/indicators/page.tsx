import React from "react";
import type { Metadata } from "next";
import { getIndicatorIndex } from "@/lib/data";
import { IndicatorsClient } from "@/components/indicators/IndicatorsClient";

export const metadata: Metadata = {
  title: "Indicators Registry | Global Development Pulse",
  description:
    "Explore 30 core development indicators across Economic, Population, Employment, Education, Digital, and Environment sectors with official World Bank metadata.",
};

export const revalidate = 3600;

export default async function IndicatorsPage() {
  const indicators = await getIndicatorIndex();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          World Bank Indicators Registry
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Standardized global development metrics tracked across 6 key pillars. Each indicator maps
          directly to official World Bank codes and follows strictly descriptive representation rules.
        </p>
      </div>

      <IndicatorsClient indicators={indicators} />
    </div>
  );
}
