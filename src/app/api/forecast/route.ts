import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { company, ticker, style, insiderSummary, sentimentStats } = body;

  const prompt = `
You are a financial analyst generating investment advice based on company context.

Company: ${company} (${ticker})
Investment Style: ${style}
Insider Summary: ${JSON.stringify(insiderSummary, null, 2)}
News Sentiment Stats: ${JSON.stringify(sentimentStats, null, 2)}

Based on this info, provide:
- A short investment forecast (1–2 sentences)
- A confidence score from 0 to 1

Respond in this format:
{
  "forecast": "string",
  "confidence_score": 0.85
}
`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const result = await res.json();

  try {
    const parsed = JSON.parse(result.choices[0].message.content);
    return Response.json(parsed);
  } catch (err) {
    console.error("Parsing failed:", result);
    return Response.json({
      forecast: "Unable to generate forecast.",
      confidence_score: 0,
    });
  }
}