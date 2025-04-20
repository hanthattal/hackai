"use client";

import { useEffect, useState } from "react";

export default function TradeOverlayCard({ ticker }: { ticker: string | null }) {
  const [cash, setCash] = useState<number>(0);
  const [shares, setShares] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [side, setSide] = useState<"buy" | "sell">("buy");

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
    const res = await fetch("/api/trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker, qty, side }),
    });

    const result = await res.json();
    if (result.success) {
      alert(`✅ ${side} executed!`);
      await refresh(); // 🔁 Refetch data after successful trade
    } else {
      alert("❌ Trade failed");
    }
  };

  return (
    <div className="absolute top-4 right-28 bg-white shadow-xl p-4 rounded-xl w-80 space-y-3 z-50">
      <h2 className="text-lg font-bold mb-2">💼 Trade {ticker}</h2>

      <div className="flex justify-between text-sm text-gray-600">
        <p>Available Cash: ${cash.toLocaleString()}</p>
        <p>Shares Held: {shares}</p>
      </div>

      <select
        value={side}
        onChange={(e) => setSide(e.target.value as "buy" | "sell")}
        className="select select-bordered w-full"
      >
        <option value="buy">Buy</option>
        <option value="sell">Sell</option>
      </select>

      <input
        type="number"
        className="input input-bordered w-full"
        placeholder="Quantity"
        value={qty}
        onChange={(e) => setQty(parseInt(e.target.value))}
        min={1}
      />

      <button className="btn btn-primary w-full" onClick={placeTrade}>
        Submit {side.toUpperCase()}
      </button>
    </div>
  );
}