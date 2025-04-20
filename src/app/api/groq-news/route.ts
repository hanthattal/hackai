import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const apiKey = process.env.GROQ_API_KEY;

  if (!text) {
    return NextResponse.json({ error: "Missing text input" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a financial news sentiment API. 
You analyze the given news and respond only in JSON format using the following structure:

{
  "sentiment_analysis": {
    "sentiment": "string (positive, negative, neutral)",
    "confidence_score": "number between 0 and 1"
  }
}`,
          },
          {
            role: "user",
            content: `News article: ${text}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Groq request failed", details: data }, { status: response.status });
    }

    try {
      const parsed = JSON.parse(data.choices[0].message.content);
      console.log("✅ Parsed Groq response:", parsed);
      return NextResponse.json(parsed);
    } catch (err) {
      console.error("❌ Failed to parse Groq JSON content:", data.choices?.[0]?.message?.content);
      return NextResponse.json(
        { error: "Failed to parse Groq JSON", raw: data },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("❌ Unexpected error in Groq API route:", err);
    return NextResponse.json({ error: "Internal server error", details: err }, { status: 500 });
  }
}