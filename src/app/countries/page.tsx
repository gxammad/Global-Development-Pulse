import React from "react";
import type { Metadata } from "next";
import { getCountryIndex } from "@/lib/data";
import { CountriesClient } from "@/components/countries/CountriesClient";

export const metadata: Metadata = {
  title: "Countries Directory | Global Development Pulse",
  description:
    "Explore 15 monitored economies across South Asia, North America, Europe, East Asia, and the Middle East with comprehensive World Bank development data.",
};

export const revalidate = 3600;

export default async function CountriesPage() {
  const countries = await getCountryIndex();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Tracked Countries Directory
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Centralized monitoring across 15 initial economies representing diverse geographic regions,
          income groups, and population scales. Powered by automated World Bank Open Data ingestion.
        </p>
      </div>

      <CountriesClient countries={countries} />
    </div>
  );
}
