"use client";

import { useEffect, useState } from "react";

type ForecastProps = {
  company: string | null;
  ticker: string | null;
  style: string | null;
};

export default function ForecastCard({ company, ticker, style }: ForecastProps) {
  const [forecast, setForecast] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);

  useEffect(() => {
    const runForecast = async () => {
      if (!ticker || !company || !style) return;

      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          company,
          style,
          insiderSummary: {}, // placeholder
          sentimentStats: { positive: 3, neutral: 2, negative: 1 }, // temp
        }),
      });

      const data = await res.json();
      setForecast(data.forecast);
      setConfidence(data.confidence_score);
    };

    runForecast();
  }, [company, ticker, style]);

  return (
    <div className="bg-base-100 shadow p-4 rounded-xl">
      <h2 className="text-xl font-semibold">🔮 Forecast</h2>
      {forecast ? (
        <>
          <p className="text-lg">{forecast}</p>
          <p className="text-sm text-gray-500 mt-2">
            Confidence: {confidence !== null ? `${(confidence * 100).toFixed(1)}%` : "—"}
          </p>
        </>
      ) : (
        <p className="text-gray-500">Generating forecast...</p>
      )}
    </div>
  );
}