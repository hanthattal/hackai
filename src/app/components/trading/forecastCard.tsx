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
    <div tabIndex={0} className="collapse collapse-arrow bg-slate-100 rounded-2xl shadow">
      <div className="collapse-title text-xl font-semibold">
        <div className="space-y-6 pt-2">
          <h3 className="text-lg font-semibold text-green-700">🔮 Forecast</h3>
          {forecast ? (
            <p className="text-sm text-gray-700 mt-2">{forecast}</p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Generating forecast...</p>
          )}
        </div>
      </div>
      
      <div className="collapse-content">
        <div className="space-y-6 pt-2">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">📊 Confidence Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Confidence Score</p>
                <p className="font-semibold">
                  {confidence !== null ? `${(confidence * 100).toFixed(1)}%` : "N/A"}
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Forecast Based On</p>
                <p className="font-semibold">{ticker || "N/A"} ({company || "Unknown"})</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-green-700">📝 Detailed Analysis</h3>
            <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
              {forecast || "Forecast analysis not available yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}