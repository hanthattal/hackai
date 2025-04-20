"use client";

import { useEffect, useRef } from "react";
import { createChart, LineData, Time } from "lightweight-charts";

export default function StockChart() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
      layout: {
        background: { color: "#f9fafb" },
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#e5e7eb" },
        horzLines: { color: "#e5e7eb" },
      },
      timeScale: {
        timeVisible: true,
      },
    });

    const lineSeries = chart.addLineSeries();

    // Generate initial mock data (for the last 60 minutes)
    const now = Math.floor(Date.now() / 1000);
    const data: LineData[] = Array.from({ length: 60 }, (_, i) => ({
        time: (now - (60 - i) * 60) as Time,
        value: 180 + Math.sin(i / 5) * 2 + Math.random() * 1.5,
    }));

    lineSeries.setData(data);

    // Fetch the latest trade price from Alpaca every 5 seconds
    const fetchLiveTrade = async () => {
      try {
        const res = await fetch("/api/stock-price?ticker=AAPL"); // replace with dynamic ticker if needed
        const json = await res.json();

        const tradePrice = json?.trade?.p || json?.quote?.ap || json?.quote?.bp;

        const time = new Date().toISOString().split("T")[0] as Time;

        if (tradePrice) {
          lineSeries.update({ time, value: tradePrice });
        }
      } catch (err) {
        console.error("Error fetching live price:", err);
      }
    };

    fetchLiveTrade();
    const interval = setInterval(fetchLiveTrade, 5000);

    const resize = () => {
      chart.applyOptions({
        width: chartRef.current!.clientWidth,
        height: chartRef.current!.clientHeight,
      });
    };

    window.addEventListener("resize", resize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, []);

  return <div ref={chartRef} className="w-full h-full" />;
}