import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ticker, qty = 1, side = "buy" } = body;

  const res = await fetch("https://paper-api.alpaca.markets/v2/orders", {
    method: "POST",
    headers: {
      "APCA-API-KEY-ID": process.env.ALPACA_KEY_ID!,
      "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      symbol: ticker,
      qty,
      side, // "buy" or "sell"
      type: "market",
      time_in_force: "gtc",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Alpaca error:", data);
    return new Response(JSON.stringify({ error: data.message || "Trade failed" }), { status: 500 });
  }

  return Response.json({ success: true, data });
}