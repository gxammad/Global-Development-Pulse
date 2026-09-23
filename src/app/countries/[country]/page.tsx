import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCountryData, getCountryIndex } from "@/lib/data";
import { CountryDetailClient } from "@/components/countries/CountryDetailClient";

export const revalidate = 3600;

export async function generateStaticParams() {
  const countries = await getCountryIndex();
  return countries.map((c) => ({
    country: c.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const data = await getCountryData(country);

  if (!data) {
    return {
      title: "Country Not Found | Global Development Pulse",
    };
  }

  const { country: c } = data;
  return {
    title: `${c.name} (${c.iso3}) - Development Indicators | Global Development Pulse`,
    description: `Explore verified World Bank economic, demographic, education, and digital indicators for ${c.name} (${c.region}) from 2000 to 2024.`,
    openGraph: {
      title: `${c.name} Development Profile | Global Development Pulse`,
      description: `Track ${c.name}'s GDP, population, internet connectivity, and environmental metrics.`,
    },
  };
}

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const data = await getCountryData(country);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <CountryDetailClient data={data} />
    </div>
  );
}
