import { NextResponse } from "next/server";
import { getIndicatorData } from "@/lib/data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ indicator: string }> }
) {
  const { indicator } = await params;
  const data = await getIndicatorData(indicator);

  if (!data) {
    return NextResponse.json(
      { error: `Indicator '${indicator}' not found in registry.` },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
