"use client";

import { useEffect, useRef } from "react";
import { createChart, LineData, Time } from "lightweight-charts";

export default function StockChart({ ticker }: { ticker: string }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    console.log("📊 Initializing chart for ticker:", ticker);

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
        secondsVisible: false,
      },
    });

    const lineSeries = chart.addLineSeries();

    const interpolateHistorical = (raw: { time: number; value: number }[]) => {
      const interpolated: LineData[] = [];
      const MINUTES_PER_DAY = 390;
      const SECONDS_PER_MIN = 60;

      for (let i = 0; i < raw.length; i++) {
        const dayStart = raw[i].time - (9.5 * 60 * 60); // assume 4PM close, backtrack to 9:30AM
        for (let m = 0; m < MINUTES_PER_DAY; m++) {
          interpolated.push({
            time: (dayStart + m * SECONDS_PER_MIN) as Time,
            value: raw[i].value,
          });
        }
      }

      return interpolated;
    };

    const fetchHistorical = async () => {
      try {
        console.log("📦 Fetching historical data for:", ticker);
        const res = await fetch(`/api/historical?ticker=${ticker}`);
        const json = await res.json();
        console.log("📥 Raw historical response:", json);

        if (!json || !Array.isArray(json)) {
          console.warn("⚠️ Unexpected historical format:", json);
          return;
        }

        const interpolatedData = interpolateHistorical(json);
        console.log("📊 Interpolated data points:", interpolatedData.length);
        lineSeries.setData(interpolatedData);
        chart.timeScale().fitContent();
      } catch (err) {
        console.error("❌ Historical fetch error:", err);
      }
    };

    const fetchLive = async () => {
      try {
        console.log("🔄 Fetching live price for:", ticker);
        const res = await fetch(`/api/stock-price?ticker=${ticker}`);
        const json = await res.json();
        console.log("✅ Live price response:", json);

        const tradePrice = json?.trade?.p || json?.quote?.ap || json?.quote?.bp;
        const updatedTime = Math.floor(Date.now() / 1000) as Time;

        if (tradePrice) {
          const point = { time: updatedTime, value: tradePrice };
          console.log("📈 Updating with live point:", point);
          lineSeries.update(point);
        }
      } catch (err) {
        console.error("❌ Live price fetch error:", err);
      }
    };

    fetchHistorical();
    fetchLive();
    const liveInterval = setInterval(fetchLive, 5000);

    const resize = () => {
      chart.applyOptions({
        width: chartRef.current!.clientWidth,
        height: chartRef.current!.clientHeight,
      });
    };

    window.addEventListener("resize", resize);

    return () => {
      clearInterval(liveInterval);
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, [ticker]);

  return <div ref={chartRef} className="w-full h-full" />;
}
