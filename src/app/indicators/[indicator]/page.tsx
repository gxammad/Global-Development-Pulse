import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIndicatorData, getIndicatorIndex } from "@/lib/data";
import { IndicatorDetailClient } from "@/components/indicators/IndicatorDetailClient";

export const revalidate = 3600;

export async function generateStaticParams() {
  const indicators = await getIndicatorIndex();
  return indicators.map((ind) => ({
    indicator: ind.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ indicator: string }>;
}): Promise<Metadata> {
  const { indicator } = await params;
  const data = await getIndicatorData(indicator);

  if (!data) {
    return {
      title: "Indicator Not Found | Global Development Pulse",
    };
  }

  const { indicator: ind } = data;
  return {
    title: `${ind.name} (${ind.code}) | Global Development Pulse`,
    description: `${ind.short_description} Historical World Bank data from 2000 to 2024 across 15 economies.`,
    openGraph: {
      title: `${ind.name} Global Development Trend`,
      description: `Historical time-series analysis for ${ind.name} (${ind.category}).`,
    },
  };
}

export default async function IndicatorDetailPage({
  params,
}: {
  params: Promise<{ indicator: string }>;
}) {
  const { indicator } = await params;
  const data = await getIndicatorData(indicator);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <IndicatorDetailClient data={data} />
    </div>
  );
}
