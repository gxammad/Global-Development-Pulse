import { NextResponse } from "next/server";
import { getPipelineHealth, getQualityReport } from "@/lib/data";

export async function GET() {
  const [health, quality] = await Promise.all([
    getPipelineHealth(),
    getQualityReport(),
  ]);

  if (!health) {
    return NextResponse.json(
      { error: "Pipeline health data unavailable" },
      { status: 503 }
    );
  }

  return NextResponse.json({
    health,
    quality_audit: quality,
    api_status: "operational",
    timestamp: new Date().toISOString(),
  });
}
