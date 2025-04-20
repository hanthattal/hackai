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
    <div className="w-full p-4 space-y-6 border-r h-screen overflow-y-auto bg-slate-50">
      <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
        <h1 className="text-2xl font-bold text-gray-800">
          {company || "Company"} 
          <span className="text-green-700 ml-2">({ticker || "—"})</span>
        </h1>
        <div className="flex items-center mt-2">
          <span className="text-gray-600 text-sm">Analysis Style:</span>
          <span className="ml-2 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
            {style || "Standard"}
          </span>
        </div>
      </div>
      
      <div className="space-y-6">
        <LivePrice ticker={ticker} />
        <ForecastCard company={company} ticker={ticker} style={style} />
      </div>
      
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}