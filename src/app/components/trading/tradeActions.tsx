"use client";

export default function TradeActions({ ticker }: { ticker: string | null }) {
  const placeOrder = async (side: "buy" | "sell") => {
    if (!ticker) return;

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
  };

  return (
    <div className="flex gap-4 mt-4">
      <button className="btn btn-success" onClick={() => placeOrder("buy")}>Buy</button>
      <button className="btn btn-error" onClick={() => placeOrder("sell")}>Sell</button>
    </div>
  );
}