import { NextResponse } from "next/server";
import { getIndicatorIndex } from "@/lib/data";

export async function GET() {
  const indicators = await getIndicatorIndex();
  return NextResponse.json({
    total: indicators.length,
    indicators,
  });
}
