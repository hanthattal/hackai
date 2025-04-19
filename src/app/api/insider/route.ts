import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get("ticker");
  console.log("[INSIDER] Requested ticker:", ticker);

  if (!ticker) {
    console.log("[INSIDER] ❌ Missing ticker");
    return NextResponse.json({ error: "Missing ticker" }, { status: 400 });
  }

  try {
    const apiKey = process.env.FINNHUB_API_KEY!;
    const url = `https://finnhub.io/api/v1/stock/insider-transactions?symbol=${ticker}`;
    console.log("[INSIDER] Fetching from:", url);

    const res = await fetch(url, {
      headers: {
        "X-Finnhub-Token": apiKey,
      },
    });

    const data = await res.json();
    console.log("[INSIDER] ✅ Fetched data:", JSON.stringify(data, null, 2).slice(0, 500));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[INSIDER] ❌ Error fetching from Finnhub:", error);
    return NextResponse.json({ error: "Failed to fetch from Finnhub" }, { status: 500 });
  }
}