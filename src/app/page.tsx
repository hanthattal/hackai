"use client";

import { useState } from "react";

export default function Home() {
  const [companyName, setCompanyName] = useState("");
  const [reportLink, setReportLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchAnnualReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReportLink(null);
  
    try {
      console.log("Searching for:", companyName);
      const query = companyName.toLowerCase().replace(/ /g, "+");
  
      const searchRes = await fetch(`/api/company-search`);
      const raw = await searchRes.json();
      const companies = raw.data.map((row: any[]) => ({
        cik: row[0],
        title: row[1],
        ticker: row[2],
        exchange: row[3],
      }));
      console.log("Fetched companies:", companies);
  
      const companyEntry = companies.find(
        (c: any) => c.title.toLowerCase().includes(companyName.toLowerCase())
      );
      console.log("Matched company entry:", companyEntry);
  
      if (!companyEntry) throw new Error("Company not found");

      const cik = companyEntry.cik.toString().padStart(10, "0");
      console.log("CIK:", cik);
  
      const filingsRes = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`, {
        headers: { "User-Agent": "HackathonApp/1.0 sriramsendhil@gmail.com" }
      });
      const filingsData = await filingsRes.json();
      console.log("Fetched filings data:", filingsData);
  
      const filings = filingsData.filings.recent;
      const index = filings.form.findIndex(
        (_form: string, i: number) =>
          filings.form[i] === "10-K" && filings.filingDate[i].startsWith("2024")
      );      console.log("10-K index:", index);
  
      if (index === -1) throw new Error("No 2024 10-K found");
  
      const accessionNumber = filings.accessionNumber[index].replace(/-/g, "");
      const primaryDocument = filings.primaryDocument[index];
      console.log("Accession Number:", accessionNumber);
      
      const docLink = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionNumber}/${primaryDocument}`;  
      console.log("Document Link:", docLink);
  
      setReportLink(docLink);
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
        <input
          type="text"
          placeholder="Enter MAANG Company Name"
          className="input input-bordered w-full"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Searching..." : "Find 2024 10-K"}
        </button>
      </form>

      {error && <div className="text-error mt-4">{error}</div>}

      {reportLink && (
        <div className="mt-6 text-center">
          <a className="link link-primary" href={reportLink} target="_blank">
            View 2024 Annual Report
          </a>
        </div>
      )}

    </div>
  );
}