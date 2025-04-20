import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let reportHtml: string;

  try {
    const body = await request.json();
    reportHtml = body?.reportHtml;
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err);
    return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
  }

  if (!reportHtml || typeof reportHtml !== "string") {
    return NextResponse.json({ error: "Missing or invalid reportHtml" }, { status: 400 });
  }

  try {
    const cleaned = reportHtml.replace(/<[^>]+>/g, "").slice(0, 8000);

    const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: cleaned,
        model: "text-embedding-ada-002",
      }),
    });

    const embeddingJson = await embedRes.json();
    let embedding = embeddingJson?.data?.[0]?.embedding;

    // Sanitize the embedding before sending it
    if (Array.isArray(embedding)) {
      embedding = embedding.map(value => {
        // Replace NaN, Infinity, -Infinity with 0
        if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
          return 0;
        }
        return value;
      });
    }

    return NextResponse.json({ embedding });
  } catch (err) {
    console.error("❌ Embedding generation error:", err);
    return NextResponse.json({ error: "Embedding failed" }, { status: 500 });
  }
}