"use client";

import { useEffect, useState } from "react";

export default function LivePrice({ ticker }: { ticker: string | null }) {
  const [price, setPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);

  useEffect(() => {
    if (!ticker) return;

    const fetchPrice = async () => {
      try {
        const res = await fetch(`/api/stock-price?ticker=${ticker}`);
        const data = await res.json();
        const livePrice = data?.quote?.ap || data?.quote?.bp;

        if (livePrice !== undefined) {
          if (price !== null && price !== livePrice) {
            setPreviousPrice(price);
            setPriceChange(livePrice - price);
          }
          setPrice(livePrice);
        }
      } catch (err) {
        console.error("Failed to fetch price:", err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, [ticker, price]);

  const getPriceChangeClass = () => {
    if (priceChange === null) return "";
    return priceChange > 0 ? "text-green-600" : priceChange < 0 ? "text-red-600" : "";
  };

  return (
    <div tabIndex={0} className="collapse collapse-arrow bg-slate-100 rounded-2xl shadow">
      <div className="collapse-title text-xl font-semibold">
        <div className="space-y-6 pt-2">
          <h3 className="text-lg font-semibold text-green-700">💵 Live Stock Price</h3>
          <p className="text-2xl text-gray-700 mt-2">
            {typeof price === "number" ? `$${price.toFixed(2)}` : "Loading..."}
          </p>
        </div>
      </div>
      
      <div className="collapse-content">
        <div className="space-y-6 pt-2">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">📈 Price Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Current Price</p>
                <p className="font-semibold">{typeof price === "number" ? `$${price.toFixed(2)}` : "N/A"}</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Previous Price</p>
                <p className="font-semibold">{typeof previousPrice === "number" ? `$${previousPrice.toFixed(2)}` : "N/A"}</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Change</p>
                <p className={`font-semibold ${getPriceChangeClass()}`}>
                  {typeof priceChange === "number" 
                    ? `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)} (${previousPrice ? ((priceChange / previousPrice) * 100).toFixed(2) : 0}%)`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-green-700">📊 Ticker Info</h3>
            <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
              {ticker ? `Live price data for ${ticker} refreshes automatically every 5 seconds.` : "No ticker selected."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}