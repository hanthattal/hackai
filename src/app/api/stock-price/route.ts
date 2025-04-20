// app/api/stock-price/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return new Response(JSON.stringify({ error: "Missing ticker" }), { status: 400 });
  }

  const headers = {
    "APCA-API-KEY-ID": process.env.ALPACA_KEY_ID!,
    "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
  };

  try {
    const [quoteRes, tradeRes] = await Promise.all([
      fetch(`https://data.alpaca.markets/v2/stocks/${ticker}/quotes/latest`, { headers }),
      fetch(`https://data.alpaca.markets/v2/stocks/${ticker}/trades/latest`, { headers }),
    ]);

    const quote = await quoteRes.json();
    const trade = await tradeRes.json();

    return Response.json({ quote: quote.quote, trade: trade.trade });
  } catch (err) {
    console.error("Failed to fetch stock price:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch stock price" }), { status: 500 });
  }
}