"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
          const sentimentScores = sessionStorage.getItem("sentimentScores");
          const reportEmbedding = sessionStorage.getItem("reportEmbedding");

          fetch("/api/predict", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ticker,
              strategy: investmentStyle,
              sentiment_scores: sentimentScores ? JSON.parse(sentimentScores) : undefined,
              report_embedding: reportEmbedding ? JSON.parse(reportEmbedding) : []
            })
          }).then(res => res.json())
            .then(data => console.log("📈 Prediction triggered:", data))
            .catch(err => console.error("Prediction error:", err));
        }

        router.push(
          `/home?url=${encodeURIComponent(docLink)}&company=${encodeURIComponent(companyName)}&ticker=${ticker}&source=india&style=${investmentStyle}`
        );
        return;
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
        const sentimentScores = sessionStorage.getItem("sentimentScores");
        const reportEmbedding = sessionStorage.getItem("reportEmbedding");

        fetch("/api/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ticker,
            strategy: investmentStyle,
            sentiment_scores: sentimentScores ? JSON.parse(sentimentScores) : undefined,
            report_embedding: reportEmbedding ? JSON.parse(reportEmbedding) : []
          })
        }).then(res => res.json())
          .then(data => console.log("📈 Prediction triggered:", data))
          .catch(err => console.error("Prediction error:", err));
      }

      router.push(
        `/home?url=${encodeURIComponent(docLink)}&company=${encodeURIComponent(companyEntry.title)}&ticker=${encodeURIComponent(companyEntry.ticker)}&cik=${companyEntry.cik}&style=${investmentStyle}`
      );
    } catch (err: any) {
      console.error("Error fetching report:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <form onSubmit={searchAnnualReport} className="flex flex-col items-center space-y-4 w-full max-w-md">
        
      <div className="form-control w-full">
  <label className="label">
    <span className="label-text">Select Investing Style</span>
  </label>
  <div className="flex w-full justify-between space-x-2">
    <label className="flex-1">
      <input
        type="radio"
        name="style"
        value="long"
        className="btn w-full"
        checked={investmentStyle === "long"}
        onChange={() => {
          setInvestmentStyle("long");
          sessionStorage.setItem("investmentStyle", "long");
        }}
      />
      <span className="block text-center mt-1 text-sm">📈 Long</span>
    </label>

    <label className="flex-1">
      <input
        type="radio"
        name="style"
        value="short"
        className="btn w-full"
        checked={investmentStyle === "short"}
        onChange={() => {
          setInvestmentStyle("short");
          sessionStorage.setItem("investmentStyle", "short");
        }}
      />
      <span className="block text-center mt-1 text-sm">📉 Short</span>
    </label>

    <label className="flex-1">
      <input
        type="radio"
        name="style"
        value="trading"
        className="btn w-full"
        checked={investmentStyle === "trading"}
        onChange={() => {
          setInvestmentStyle("trading");
          sessionStorage.setItem("investmentStyle", "trading");
        }}
      />
      <span className="block text-center mt-1 text-sm">⚡ Trading</span>
    </label>
  </div>
</div>

        <label className="label cursor-pointer">
          🇺🇸
          <input
            type="checkbox"
            className="toggle mx-2"
            checked={isIndia}
            onChange={(e) => setIsIndia(e.target.checked)}
          />
          🇮🇳
        </label>
        <input
          type="text"
          placeholder="Enter Company Name"
          className="input input-bordered w-full"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Searching..." : "Find 2024 10-K"}
        </button>
      </form>

      {error && <div className="text-error mt-4">{error}</div>}
    </div>
  );
}