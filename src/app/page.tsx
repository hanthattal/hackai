"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Mock stock data for the ticker carousel
const stockData = [
  { symbol: "AAPL", price: 187.32, change: +1.25 },
  { symbol: "MSFT", price: 412.65, change: -2.01 },
  { symbol: "AMZN", price: 178.45, change: +0.67 },
  { symbol: "GOOGL", price: 165.89, change: -0.35 },
  { symbol: "META", price: 475.12, change: +5.23 },
  { symbol: "TSLA", price: 218.75, change: -1.89 },
  { symbol: "NVDA", price: 894.23, change: +12.45 },
  { symbol: "JPM", price: 192.34, change: -0.23 },
  { symbol: "V", price: 274.56, change: +1.12 },
  { symbol: "WMT", price: 61.32, change: +0.48 },
  { symbol: "JNJ", price: 152.19, change: -0.75 },
  { symbol: "PG", price: 165.87, change: +0.29 },
  { symbol: "XOM", price: 114.32, change: -1.05 },
  { symbol: "BAC", price: 37.45, change: +0.38 },
  { symbol: "MA", price: 453.28, change: -2.37 },
  { symbol: "ADBE", price: 484.19, change: +4.12 },
  { symbol: "CRM", price: 275.63, change: -1.23 },
  { symbol: "DIS", price: 118.92, change: +0.87 },
  { symbol: "NFLX", price: 592.45, change: +8.23 },
  { symbol: "PYPL", price: 64.52, change: -0.34 }
];

// Component for the moving ticker
const StockTicker = () => {
  // Create three identical rows for seamless animation
  const tickerRows = [
    stockData,
    stockData,
    stockData
  ];
  
  return (
    <div className="absolute inset-0 overflow-hidden opacity-25 z-0">
      {/* Top row - moving right */}
      <div className="ticker-row-right">
        <div className="flex space-x-6 whitespace-nowrap animate-ticker-right">
          {tickerRows[0].map((stock, index) => (
            <div key={`top-${stock.symbol}-${index}`} className="flex items-center">
              <span className="font-mono font-bold">{stock.symbol}</span>
              <span className="ml-2 font-mono">${stock.price.toFixed(2)}</span>
              <span className={`ml-2 font-mono ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {tickerRows[0].map((stock, index) => (
            <div key={`top-dup-${stock.symbol}-${index}`} className="flex items-center">
              <span className="font-mono font-bold">{stock.symbol}</span>
              <span className="ml-2 font-mono">${stock.price.toFixed(2)}</span>
              <span className={`ml-2 font-mono ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Middle row - moving left */}
      <div className="ticker-row-left mt-12">
        <div className="flex space-x-6 whitespace-nowrap animate-ticker-left">
          {tickerRows[1].map((stock, index) => (
            <div key={`middle-${stock.symbol}-${index}`} className="flex items-center">
              <span className="font-mono font-bold">{stock.symbol}</span>
              <span className="ml-2 font-mono">${stock.price.toFixed(2)}</span>
              <span className={`ml-2 font-mono ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {tickerRows[1].map((stock, index) => (
            <div key={`middle-dup-${stock.symbol}-${index}`} className="flex items-center">
              <span className="font-mono font-bold">{stock.symbol}</span>
              <span className="ml-2 font-mono">${stock.price.toFixed(2)}</span>
              <span className={`ml-2 font-mono ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom row - moving right (faster) */}
      <div className="ticker-row-right-fast mt-24">
        <div className="flex space-x-6 whitespace-nowrap animate-ticker-right-fast">
          {tickerRows[2].map((stock, index) => (
            <div key={`bottom-${stock.symbol}-${index}`} className="flex items-center">
              <span className="font-mono font-bold">{stock.symbol}</span>
              <span className="ml-2 font-mono">${stock.price.toFixed(2)}</span>
              <span className={`ml-2 font-mono ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {tickerRows[2].map((stock, index) => (
            <div key={`bottom-dup-${stock.symbol}-${index}`} className="flex items-center">
              <span className="font-mono font-bold">{stock.symbol}</span>
              <span className="ml-2 font-mono">${stock.price.toFixed(2)}</span>
              <span className={`ml-2 font-mono ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isIndia, setIsIndia] = useState(false);
  const [investmentStyle, setInvestmentStyle] = useState("long");
  
  useEffect(() => {
    const storedStyle = sessionStorage.getItem("investmentStyle");
    if (storedStyle) {
      setInvestmentStyle(storedStyle);
    }
  }, []);

  const router = useRouter();

  const searchAnnualReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isIndia) {
        const nameToTicker: Record<string, string> = {
          "infosys": "INFY",
          "tata consultancy services": "TCS",
          "reliance industries": "RELIANCE",
          "hdfc bank": "HDFCBANK",
          "ltimindtree": "LTIM"
        };

        const normalized = companyName.toLowerCase().trim();
        const ticker = nameToTicker[normalized];
        sessionStorage.setItem("ticker", ticker);

        if (!ticker) {
          throw new Error("Company not recognized. Try Infosys, TCS, Reliance Industries, HDFC Bank, or LTIMindtree.");
        }

        const knownPDFs: Record<string, string> = {
          INFY: "https://www.infosys.com/investors/reports-filings/annual-report/annual/Documents/infosys-ar-23.pdf",
          LTIM: "https://www.ltimindtree.com/annual-report-html/pdf/Integrated-Annual-Report-FY-2023-24.pdf"
        };

        const docLink = knownPDFs[ticker];

        if (!investmentStyle || !companyName) {
          console.warn("Prediction skipped: missing ticker or investment style.");
        } else {
          router.push(
            `/home?url=${encodeURIComponent(docLink)}&company=${encodeURIComponent(companyName)}&ticker=${ticker}&source=india&style=${investmentStyle}`
          );
          return;
        }
      }

      // US (SEC) logic
      const query = companyName.toLowerCase().replace(/ /g, "+");

      const searchRes = await fetch(`/api/company-search`);
      const raw = await searchRes.json();
      const companies = raw.data.map((row: any[]) => ({
        cik: row[0],
        title: row[1],
        ticker: row[2],
        exchange: row[3],
      }));

      const companyEntry = companies.find(
        (c: any) => c.title.toLowerCase().includes(companyName.toLowerCase())
      );

      if (!companyEntry) throw new Error("Company not found");

      const cik = companyEntry.cik.toString().padStart(10, "0");

      const filingsRes = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`, {
        headers: { "User-Agent": "HackathonApp/1.0 sriramsendhil@gmail.com" }
      });
      const filingsData = await filingsRes.json();

      const filings = filingsData.filings.recent;
      const index = filings.form.findIndex(
        (_form: string, i: number) =>
          filings.form[i] === "10-K" && filings.filingDate[i].startsWith("2024")
      );

      if (index === -1) throw new Error("No 2024 10-K found");

      const accessionNumber = filings.accessionNumber[index].replace(/-/g, "");
      const primaryDocument = filings.primaryDocument[index];

      const docLink = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionNumber}/${primaryDocument}`;

      const ticker = companyEntry.ticker;
      sessionStorage.setItem("ticker", ticker);

      if (!investmentStyle || !companyName) {
        console.warn("Prediction skipped: missing ticker or investment style.");
      } else {
        router.push(
          `/home?url=${encodeURIComponent(docLink)}&company=${encodeURIComponent(companyEntry.title)}&ticker=${encodeURIComponent(companyEntry.ticker)}&cik=${companyEntry.cik}&style=${investmentStyle}`
        );
      }
    } catch (err: any) {
      console.error("Error fetching report:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 relative overflow-hidden">
      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes tickerRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes tickerLeft {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        
        @keyframes tickerRightFast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-ticker-right {
          animation: tickerRight 60s linear infinite;
        }
        
        .animate-ticker-left {
          animation: tickerLeft 70s linear infinite;
        }
        
        .animate-ticker-right-fast {
          animation: tickerRightFast 50s linear infinite;
        }
        
        .ticker-row-right, .ticker-row-left, .ticker-row-right-fast {
          position: absolute;
          left: 0;
          right: 0;
          padding: 1rem 0;
        }
        
        .ticker-row-right { top: 10%; }
        .ticker-row-left { top: 40%; }
        .ticker-row-right-fast { top: 70%; }
      `}</style>

      <h1 className="text-8xl font-bold text-center mt-12 z-50 bg-gradient-to-r from-green-400 to-green-800 text-transparent bg-clip-text">
        FinanceJockey
      </h1>
      
      <div className="flex flex-1 items-center justify-center relative">
        {/* Stock ticker carousel background */}
        <StockTicker />
        
        {/* Main form card */}
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg z-10">
          <div className="mb-6 text-center">
            <p className="text-green-600 text-sm mt-1">Annual Report Analysis Tool</p>
          </div>
          
          <form onSubmit={searchAnnualReport} className="flex flex-col space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-700 font-medium">Investment Strategy</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className={`flex flex-col items-center p-3 rounded-lg cursor-pointer border ${investmentStyle === "long" ? "border-green-500 bg-green-50" : "border-gray-300"}`}
                  onClick={() => {
                    setInvestmentStyle("long");
                    sessionStorage.setItem("investmentStyle", "long");
                  }}>
                  <span className="text-xl mb-1">📈</span>
                  <input
                    type="radio"
                    name="style"
                    value="long"
                    className="hidden"
                    checked={investmentStyle === "long"}
                    onChange={() => {
                      setInvestmentStyle("long");
                      sessionStorage.setItem("investmentStyle", "long");
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">Long</span>
                </div>

                <div className={`flex flex-col items-center p-3 rounded-lg cursor-pointer border ${investmentStyle === "short" ? "border-green-500 bg-green-50" : "border-gray-300"}`}
                  onClick={() => {
                    setInvestmentStyle("short");
                    sessionStorage.setItem("investmentStyle", "short");
                  }}>
                  <span className="text-xl mb-1">📉</span>
                  <input
                    type="radio"
                    name="style"
                    value="short"
                    className="hidden"
                    checked={investmentStyle === "short"}
                    onChange={() => {
                      setInvestmentStyle("short");
                      sessionStorage.setItem("investmentStyle", "short");
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">Short</span>
                </div>

                <div className={`flex flex-col items-center p-3 rounded-lg cursor-pointer border ${investmentStyle === "trading" ? "border-green-500 bg-green-50" : "border-gray-300"}`}
                  onClick={() => {
                    setInvestmentStyle("trading");
                    sessionStorage.setItem("investmentStyle", "trading");
                  }}>
                  <span className="text-xl mb-1">⚡</span>
                  <input
                    type="radio"
                    name="style"
                    value="trading"
                    className="hidden"
                    checked={investmentStyle === "trading"}
                    onChange={() => {
                      setInvestmentStyle("trading");
                      sessionStorage.setItem("investmentStyle", "trading");
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">Trading</span>
                </div>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-700 font-medium">Market</span>
              </label>
              <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2">
                <span className={`flex-1 text-center py-2 rounded-md ${!isIndia ? "bg-white shadow-sm font-medium text-green-600" : "text-gray-600"}`} 
                  onClick={() => setIsIndia(false)}>
                  🇺🇸 US Market
                </span>
                <span className={`flex-1 text-center py-2 rounded-md ${isIndia ? "bg-white shadow-sm font-medium text-green-600" : "text-gray-600"}`}
                  onClick={() => setIsIndia(true)}>
                  🇮🇳 India Market
                </span>
                <input
                  type="checkbox"
                  className="toggle hidden"
                  checked={isIndia}
                  onChange={(e) => setIsIndia(e.target.checked)}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-700 font-medium">Company Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter Company Name"
                className="input input-bordered w-full bg-gray-50 border-gray-300 focus:border-green-500 focus:ring-green-500"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              {isIndia && (
                <div className="text-xs text-gray-500 mt-1">
                  Supported: Infosys, TCS, Reliance Industries, HDFC Bank, LTIMindtree
                </div>
              )}
            </div>

              <button
              type="submit"
              className="btn bg-gradient-to-r from-green-700 to-green-400 hover:to-green-900 text-white border-none"
              disabled={loading}
              >
              {loading ? (
                <>
                <span className="loading loading-spinner loading-xs mr-2"></span>
                Searching...
                </>
              ) : (
                <>Find Annual Report</>
              )}
              </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
      
      <div className="m-4 text-center text-gray-500 text-xs">
        © 2025 FinanceJockey - All rights reserved
      </div>
    </div>
  );
}