import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const res = await fetch("https://paper-api.alpaca.markets/v2/account", {
    headers: {
      "APCA-API-KEY-ID": process.env.ALPACA_KEY_ID!,
      "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Alpaca Account Error:", data);
    return new Response(JSON.stringify({ error: "Failed to fetch account" }), { status: 500 });
  }

  return Response.json(data);
}