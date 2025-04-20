import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  if (!ticker) {
    return NextResponse.json({ error: "Missing ticker" }, { status: 400 });
  }

  try {
    const now = new Date();
    const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const result = await yahooFinance.historical(ticker, {
      period1: past,
      period2: now,
      interval: "1d",
    });

    const data = result.map((bar: any) => ({
      time: Math.floor(new Date(bar.date).getTime() / 1000), // UNIX timestamp in seconds
      value: bar.close,
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch historical:", err);
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 500 });
  }
}