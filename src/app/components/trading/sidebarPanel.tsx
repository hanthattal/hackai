"use client";

import React from "react";
import LivePrice from "./livePrice"; // Update the path to the correct location of LivePrice
import ForecastCard from "./forecastCard";

export default function SidebarPanel({
  company,
  ticker,
  style,
}: {
  company: string | null;
  ticker: string | null;
  style: string | null;
}) {
  return (
    <div className="w-full p-4 space-y-4 border-r h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold">{company} ({ticker})</h1>
      <p className="text-gray-600">Style: <strong>{style}</strong></p>
      <LivePrice ticker={ticker} />
      <ForecastCard company={company} ticker={ticker} style={style} />
    </div>
  );
}