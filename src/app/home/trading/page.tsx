"use client";

import { useSearchParams } from "next/navigation";
import SidebarPanel from "@/app/components/trading/sidebarPanel";
import StockChart from "@/app/components/trading/stockChart";
import TradeOverlayCard from "@/app/components/trading/tradeOverlayCard";

export default function TradingPage() {
  const searchParams = useSearchParams();
  const ticker = searchParams.get("ticker");
  const company = searchParams.get("company");
  const style = searchParams.get("style");

  return (
    <div className="flex overflow-hidden" style={{ height: "calc(100vh - 65px)" }}>
  {/* Navbar is handled in layout.tsx and takes up top height (e.g. 16 = 4rem) */}
  <div className="flex flex-grow overflow-hidden">
    {/* Sidebar */}
    <div className="w-1/4 p-4 overflow-y-auto border-r h-full">
      <SidebarPanel ticker={ticker} company={company} style={style} />
    </div>

    {/* Chart area */}
    <div className="relative flex-1 overflow-y-auto h-full w-full">
      <StockChart ticker={ticker || "defaultTicker"}/>
      <TradeOverlayCard ticker={ticker} />
    </div>
  </div>
</div>
  );
} 