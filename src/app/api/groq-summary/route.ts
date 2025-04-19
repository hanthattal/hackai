import { NextRequest, NextResponse } from "next/server";

const CHUNK_SIZE = 7;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export async function POST(req: NextRequest) {
  const { ticker, data } = await req.json();
  const transactions = data?.data || [];

  console.log(`[GROQ] Received ${transactions.length} transactions for ${ticker}`);

  if (!transactions.length) {
    return NextResponse.json({ summary: "No insider transactions found." });
  }

  const chunks = chunkArray(transactions, CHUNK_SIZE);
  const summaries: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const prompt = `
You are an investment analyst. Here's insider trading data for ${ticker} (chunk ${i + 1} of ${chunks.length}). Summarize trends or notable actions:

${JSON.stringify(chunk, null, 2)}

Give a short summary only.
`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      });

        const json = await res.json();
        const text = json.choices?.[0]?.message?.content;

        if (text) {
        summaries.push(`🧩 Chunk ${i + 1}:\n${text}`);
        console.log(`[GROQ] ✅ Chunk ${i + 1} summarized`);
        } else {
        summaries.push(`⚠️ Chunk ${i + 1} returned no summary.`);
        console.warn(`[GROQ] ⚠️ No summary text returned for chunk ${i + 1}`);
        }
        
    } catch (err) {
      console.error(`[GROQ] ❌ Error summarizing chunk ${i + 1}:`, err);
      summaries.push(`⚠️ Chunk ${i + 1} failed to summarize.`);
    }

    await new Promise((res) => setTimeout(res, 150));
  }

  return NextResponse.json({ summary: summaries.join("\n\n") });
}