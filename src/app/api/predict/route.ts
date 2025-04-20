import * as fs from "fs";
import * as path from "path";
import { NextResponse } from 'next/server';
import yahooFinance from "yahoo-finance2";

function runModel(strategy: string) {
  const modelMap: Record<string, string> = {
    long: "long_term_unified.pt",
    short: "short_term_model.pt",
    trading: "daily_multitask.pt",
  };

  const filename = modelMap[strategy];
  const modelFilePath = path.join(process.cwd(), "models", filename);
  const exists = fs.existsSync(modelFilePath);

  return exists
    ? { modelPath: modelFilePath, message: `✅ ${filename} loaded.` }
    : { error: `❌ Model file not found for ${strategy}.` };
}

export async function POST(req: Request) {
  const body = await req.json();
  const { strategy } = body;
  
  let windowSize = 0;
  if (strategy === "long") windowSize = 180;
  else if (strategy === "short") windowSize = 90;
  else if (strategy === "trading") windowSize = 30;
  
  const ticker = body.ticker;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - windowSize);

  let pricing_data = [];

  try {
    const result = await yahooFinance.historical(ticker, {
      period1: startDate,
      period2: endDate,
    });

    pricing_data = result.slice(-windowSize).map(day => [
      day.close ?? 0,
      day.open ?? 0,
      day.high ?? 0,
      day.low ?? 0,
      day.volume ?? 0,
    ]);
  } catch (err) {
    console.error("Error fetching price data:", err);
    return NextResponse.json({ error: "Failed to fetch historical pricing data" }, { status: 500 });
  }

  body.pricing_data = pricing_data;

  if (!body.sentiment_scores) {
    body.sentiment_scores = [
      { sentiment: "neutral", confidence_score: 1.0 }
    ];
  }

  try {
    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch prediction from backend" }, { status: 500 });
  }
}
