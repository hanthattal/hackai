import { NextRequest, NextResponse } from "next/server";

const CHUNK_SIZE = 10;

function enrichTransactions(transactions: any[]): any[] {
  const now = new Date();

  return transactions.map((t) => {
    const change = Number(t.change) || 0;
    const price = Number(t.transactionPrice) || 0;
    const value = Math.abs(change * price);
    const date = new Date(t.transactionDate);
    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    return {
      name: t.name,
      symbol: t.symbol,
      transactionDate: t.transactionDate,
      filingDate: t.filingDate,
      change,
      transactionPrice: price,
      transactionValue: value,
      isSell: change < 0,
      isDerivative: t.isDerivative,
      transactionCode: t.transactionCode,
      daysAgo,
    };
  });
}

export async function POST(req: NextRequest) {
  const { ticker, data } = await req.json();
  const transactions = data?.data || [];

  console.log(`[GPT-3.5] Received ${transactions.length} transactions for ${ticker}`);

  if (!transactions.length) {
    return NextResponse.json({ summary: "No insider transactions found." });
  }

  const enriched = enrichTransactions(transactions);

  const prompt = `
You are a financial analysis API. Summarize the following enriched insider trading data for ${ticker} in strict JSON format.

Respond with this JSON schema:
{
  "summary": string,
  "key_actions": Array<{
    "insider": string,
    "action": "buy" | "sell",
    "shares": number,
    "value_usd": number,
    "transaction_date": string
  }>,
  "totals": {
    "total_shares_sold": number,
    "total_value_sold": number,
    "date_range": { "from": string, "to": string }
  },
  "conclusion": string
}

Here is the input data:
${JSON.stringify(enriched, null, 2)}
`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SRIRAM_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-1106",
        messages: [
          { role: "system", content: "You are a financial analysis API. Return a clean JSON summary only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    const json = await res.json();
    console.log("[GPT-3.5] ✅ Final JSON output:", json);
    return NextResponse.json(json);
  } catch (err) {
    console.error("[GPT-3.5] ❌ Error generating JSON summary:", err);
    return NextResponse.json({ error: "Failed to summarize insider trading data." }, { status: 500 });
  }
}
