"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatbotModalEverything from '@/app/components/chatbotModalEverything';
import { MessageSquare } from "lucide-react";
import { InsiderTradingSection, InsiderSummary } from '@/app/components/insidertrading';
import GlobalNewsWithSentiment from '@/app/components/globalNews';
import ChatbotModal from '../components/chatbotModal';

const sanitizeEmbedding = (embeddingArray: number[]) => {
  const MAX_SAFE = 1e100;
  const MIN_SAFE = -1e100;
  return embeddingArray.map(value => {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
      return 0;
    }
    if (value > MAX_SAFE) return MAX_SAFE;
    if (value < MIN_SAFE) return MIN_SAFE;
    return value;
  });
};

const HomePage = () => {

    const searchParams = useSearchParams();
    const reportLink = searchParams.get('url');
    const company = searchParams.get('company');
    console.log("🧪 Company from URL:", company);
    const ticker = searchParams.get('ticker');
    const cik = searchParams.get('cik');
    const source = searchParams.get('source'); // "india" if from Screener.in
    const strategy = searchParams.get("strategy") || "long";

    const isIndia = source === "india";

    const [openModal, setOpenModal] = useState(false)
    const [insiderSummary, setInsiderSummary] = useState<InsiderSummary | null>(null);

    //console.log("Report Link:", reportLink);

    useEffect(() => {
        const fetchSummary = async () => {
        if (!ticker) return;
    
        //console.log("📦 Fetching insider data for:", ticker);
        const res = await fetch(`/api/insider?ticker=${ticker}`);
        const data = await res.json();
        //console.log("✅ Insider data:", data);
    
        const summaryRes = await fetch("/api/groq-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ticker, data }),
        });
    
        const summaryJson = await summaryRes.json();
        //console.log("🧠 GPT Summary:", summaryJson);
    
        try {
            const parsed = typeof summaryJson.choices?.[0]?.message?.content === "string"
            ? JSON.parse(summaryJson.choices[0].message.content)
            : summaryJson;
            setInsiderSummary(parsed);
        } catch (err) {
            console.error("❌ Error parsing summary JSON:", err);
        }
        };
  
        fetchSummary();
    }, [ticker]);

    useEffect(() => {
        const fetchReportToStorage = async () => {
          if (!reportLink) return;
      
          try {
            const res = await fetch(`/api/report?url=${encodeURIComponent(reportLink)}`);
            const contentType = res.headers.get("Content-Type");
      
            if (contentType?.includes("pdf")) {
              const blob = await res.blob();
              const reader = new FileReader();
      
              reader.onloadend = () => {
                const base64data = reader.result;
                sessionStorage.setItem("reportPDF", base64data as string);
              };
      
              reader.readAsDataURL(blob); // convert to base64
            } else {
              const htmlText = await res.text();
              sessionStorage.setItem("reportHTML", htmlText);
                const embedRes = await fetch("/api/generate-embeddings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reportHtml: htmlText }),
                });
                const embedJson = await embedRes.json();
                if (embedJson?.embedding) {
                    sessionStorage.setItem("reportEmbedding", JSON.stringify(embedJson.embedding));
                    console.log("🧠 Stored reportEmbedding to sessionStorage");
                }
            }
      
            console.log("📦 Report saved to sessionStorage");
          } catch (err) {   
            console.error("❌ Failed to fetch or store report:", err);
          }
        };
      
      fetchReportToStorage();
    }, [reportLink]);

    useEffect(() => {
      const tryPredict = async () => {
        let retries = 0;
        while (!sessionStorage.getItem("reportEmbedding") && retries < 10) {
          await new Promise((r) => setTimeout(r, 300)); // wait 300ms
          retries++;
        }

        const reportEmbedding = sessionStorage.getItem("reportEmbedding");
        console.log("📦 Raw reportEmbedding from sessionStorage:", reportEmbedding);
        const sentimentScores = sessionStorage.getItem("sentimentScores");
        if (!reportEmbedding) {
          console.warn("❌ reportEmbedding not ready after retrying");
          return;
        }

        let safeEmbedding: number[] = [];

        try {
          const rawEmbedding = JSON.parse(reportEmbedding);
          console.log("🧪 Pre-sanitization embedding sample (first 5):", rawEmbedding.slice(0, 5));
          safeEmbedding = sanitizeEmbedding(rawEmbedding);
          console.log("✅ Post-sanitization embedding sample (first 5):", safeEmbedding.slice(0, 5));
        } catch (error) {
          console.error("Error parsing embedding:", error);

          try {
            const sanitizedString = reportEmbedding
              .replace(/NaN/g, "0")
              .replace(/-?Infinity/g, "0");
            
            const rawEmbedding = JSON.parse(sanitizedString);
            console.log("🧪 Fallback: pre-sanitization embedding sample (first 5):", rawEmbedding.slice(0, 5));
            safeEmbedding = sanitizeEmbedding(rawEmbedding);
            console.log("✅ Fallback: post-sanitization embedding sample (first 5):", safeEmbedding.slice(0, 5));
          } catch (secondError) {
            console.error("Failed to sanitize and parse embedding:", secondError);
            return;
          }
        }
        const sanitizeForJSON = (obj: any): any => {
          if (Array.isArray(obj)) {
            return obj.map(sanitizeForJSON);
          } else if (obj && typeof obj === 'object') {
            return Object.fromEntries(
              Object.entries(obj).map(([k, v]) => [k, sanitizeForJSON(v)])
            );
          } else if (typeof obj === 'number') {
            if (!isFinite(obj) || isNaN(obj)) return 0;
            return Math.min(Math.max(obj, -1e100), 1e100); // clamp extreme floats
          }
          return obj;
        };

        let payload;
        try {
          payload = JSON.stringify(
            sanitizeForJSON({
              ticker,
              strategy,
              sentiment_scores: sentimentScores ? JSON.parse(sentimentScores) : [],
              report_embedding: safeEmbedding,
            })
          );
          console.log("🧪 JSON payload created successfully");
        } catch (e) {
          console.error("❌ Failed to stringify payload:", e);
          return;
        }

        console.log("🚀 Sending payload to /api/predict:", payload);
        try {
          const response = await fetch("/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
          });

          const prediction = await response.json();
        } catch (err) {
          console.error("❌ Error sending prediction request:", err);
        }
      };
      tryPredict();
    }, []);
  
    return (
        <div className="flex h-screen relative ">
        {/* Left half: PDF viewer */}
        <div className="w-1/2 bg-base-100 border-r border-base-300 p-8 bg-gray-50">
            <h1 className="text-2xl font-bold mb-4">
            {ticker} Annual Report 
            </h1>

            {reportLink ? (
                <iframe
                    src={`/api/report?url=${encodeURIComponent(reportLink)}`}
                    width="100%"
                    height="100%"
                    className="rounded"
                />
                ) : (
                <p>No report selected.</p>
            )}
        </div>

        {/* Right half */}
        <div className="w-1/2 p-4">
            <p className="text-lg font-semibold mt-6">Insider Trading</p>
            {insiderSummary ? (
                <InsiderTradingSection insiderSummary={insiderSummary} />
                ) : (
                <p className="text-gray-500">Loading insider trading summary...</p>
            )}
            <p className="text-lg font-semibold mt-6">News</p>
            {company ? (
                <GlobalNewsWithSentiment company={company} />
            ) : (
                <p className="text-gray-500">No company selected.</p>
            )}

        </div>

        {/* Floating Button */}
        <button
            className="btn btn-primary rounded-full fixed bottom-6 right-6 shadow-lg gap-2 border-transparent bg-green-500 hover:bg-green-800 transition-colors"
            onClick={() => setOpenModal(true)}
        >
            <MessageSquare className="w-5 h-5" />
        </button>

        
        {isIndia ? (
            <ChatbotModal isOpen={openModal} onClose={() => setOpenModal(false)} />
        ) : (
            <ChatbotModalEverything isOpen={openModal} onClose={() => setOpenModal(false)} />
        )}
        </div>
    );
};

export default HomePage;