"use client";

import { useEffect, useState } from "react";

export default function TradeCard({ ticker }: { ticker: string | null }) {
  const [cash, setCash] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAccount = async () => {
    const res = await fetch("/api/alpaca/account");
    const data = await res.json();
    setCash(parseFloat(data.cash));
  };

  const fetchPosition = async () => {
    if (!ticker) return;
    const res = await fetch(`/api/alpaca/position?ticker=${ticker}`);
    const data = await res.json();
    setShares(parseInt(data.qty || "0"));
  };

  const refresh = async () => {
    await Promise.all([fetchAccount(), fetchPosition()]);
  };

  useEffect(() => {
    refresh();
  }, [ticker]);

  const placeTrade = async () => {
    if (!ticker || qty <= 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, qty, side }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`✅ ${side.toUpperCase()} order for ${qty} shares of ${ticker} executed!`);
        await refresh();
      } else {
        alert("❌ Trade failed");
      }
    } catch (error) {
      console.error("Trade error:", error);
      alert("❌ Trade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100">

    
    <div className=" rounded-xl shadow bg-white border-t-4 border-green-600 w-3/4 h-auto">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">💼 Trade {ticker}</h2>
        <div className="badge bg-green-50 text-green-800 border-green-200">Live</div>
      </div>

      <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg mb-4">
        <div className="text-sm">
          <p className="text-gray-500">Available Cash</p>
          <p className="font-medium text-gray-800">${cash.toLocaleString()}</p>
        </div>
        <div className="text-sm">
          <p className="text-gray-500">Shares Held</p>
          <p className="font-medium text-gray-800">{shares.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Order Type</label>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as "buy" | "sell")}
            className="select select-bordered w-full"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Quantity</label>
          <input
            type="number"
            className="input input-bordered w-full"
            placeholder="Quantity"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 0)}
            min={1}
          />
        </div>

        <button
          className={`btn w-full ${
            side === "buy"
              ? "bg-gradient-to-r from-green-700 to-green-500 hover:from-green-800 hover:to-green-600 text-white border-none"
              : "bg-white border-2 border-green-600 text-green-700 hover:bg-green-50"
          }`}
          onClick={placeTrade}
          disabled={loading || !ticker || qty <= 0}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-xs mr-2"></span>
              Processing...
            </>
          ) : (
            <>
              {side === "buy" ? "Buy" : "Sell"} {qty} {ticker}{" "}
              {side === "buy" ? "Shares" : shares < qty ? "(Short)" : "Shares"}
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Market orders executed at current price
        </p>
      </div>
    </div>
    </div>
  );
}