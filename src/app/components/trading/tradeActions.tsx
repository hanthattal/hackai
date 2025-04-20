"use client";

import { useState } from "react";

export default function TradeActions({ ticker }: { ticker: string | null }) {
  const [loading, setLoading] = useState<"buy" | "sell" | null>(null);

  const placeOrder = async (side: "buy" | "sell") => {
    if (!ticker) return;
    
    setLoading(side);
    
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, side }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`✅ ${side.toUpperCase()} order placed!`);
      } else {
        alert("❌ Trade failed");
      }
    } catch (error) {
      console.error("Trade error:", error);
      alert("❌ Trade failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 w-full">
      <h2 className="text-xl font-semibold mb-4">💹 Trade Actions</h2>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          className="btn bg-gradient-to-r from-green-700 to-green-500 hover:from-green-800 hover:to-green-600 text-white border-none flex-1"
          onClick={() => placeOrder("buy")}
          disabled={loading !== null}
        >
          {loading === "buy" ? (
            <>
              <span className="loading loading-spinner loading-xs mr-2"></span>
              Processing...
            </>
          ) : (
            <>Buy {ticker}</>
          )}
        </button>
        
        <button 
          className="btn bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 flex-1"
          onClick={() => placeOrder("sell")}
          disabled={loading !== null}
        >
          {loading === "sell" ? (
            <>
              <span className="loading loading-spinner loading-xs mr-2"></span>
              Processing...
            </>
          ) : (
            <>Sell {ticker}</>
          )}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        Orders are executed at market price
      </p>
    </div>
  );
}