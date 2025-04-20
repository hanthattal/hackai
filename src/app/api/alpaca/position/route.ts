import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return new Response(JSON.stringify({ error: "Missing ticker" }), { status: 400 });
  }

  const res = await fetch(`https://paper-api.alpaca.markets/v2/positions/${ticker}`, {
    headers: {
      "APCA-API-KEY-ID": process.env.ALPACA_KEY_ID!,
      "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
    },
  });

  if (res.status === 404) {
    // No position for this ticker
    return Response.json({ qty: 0 });
  }

  const data = await res.json();

  if (!res.ok) {
    console.error("Alpaca Position Error:", data);
    return new Response(JSON.stringify({ error: "Failed to fetch position" }), { status: 500 });
  }

  return Response.json(data);
}