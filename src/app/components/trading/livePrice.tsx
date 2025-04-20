"use client";

import { useEffect, useState } from "react";

export default function LivePrice({ ticker }: { ticker: string | null }) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!ticker) return;

    const fetchPrice = async () => {
      try {
        const res = await fetch(`/api/stock-price?ticker=${ticker}`);
        const data = await res.json();
        const livePrice = data?.quote?.ap || data?.quote?.bp;

        if (livePrice !== undefined) setPrice(livePrice);
      } catch (err) {
        console.error("Failed to fetch price:", err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, [ticker]);

  return (
    <div className="bg-base-100 shadow p-4 rounded-xl">
      <h2 className="text-xl font-semibold">💵 Live Stock Price</h2>
      <p className="text-2xl mt-2">
        {typeof price === "number" ? `$${price.toFixed(2)}` : "Loading..."}
      </p>
    </div>
  );
}