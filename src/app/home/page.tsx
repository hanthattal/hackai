"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatbotModal from '@/app/components/chatbotModal';
import { MessageSquare } from "lucide-react";

const HomePage = () => {
  const searchParams = useSearchParams();
  const reportLink = searchParams.get('url');
  const company = searchParams.get('company');
  const ticker = searchParams.get('ticker');
  const cik = searchParams.get('cik');
  const source = searchParams.get('source'); // "india" if from Screener.in

  const isIndia = source === "india";

  const [openModal, setOpenModal] = useState(false)
  const [insiderSummary, setInsiderSummary] = useState("Loading...");
  
  console.log("Report Link:", reportLink);

    useEffect(() => {
    const fetchInsiderSummary = async () => {
        if (!ticker) return;

        try {
        console.log("📦 Fetching insider data for:", ticker);
        const insiderRes = await fetch(`/api/insider?ticker=${ticker}`);
        const insiderData = await insiderRes.json();
        console.log("✅ Insider data:", insiderData);

        const groqRes = await fetch("/api/groq-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ticker, data: insiderData }),
        });

        const groq = await groqRes.json();
        console.log("🧠 Groq Summary:", groq.summary);
        setInsiderSummary(groq.summary);
        } catch (err) {
        console.error("❌ Error generating summary:", err);
        setInsiderSummary("Failed to generate summary.");
        }
    };

    fetchInsiderSummary();
    }, [ticker]);

  return (
    <div className="flex h-screen relative">
      {/* Left half: PDF viewer */}
      <div className="w-1/2 bg-base-100 border-r border-base-300 p-4 bg-gray-50">
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
        <p className="text-xl font-semibold mb-2">Insider Trading</p>
        <p className="whitespace-pre-wrap text-sm">{insiderSummary}</p>
    </div>

      {/* Floating Button */}
      <button
        className="btn btn-primary rounded-full fixed bottom-6 right-6 shadow-lg gap-2"
        onClick={() => setOpenModal(true)}
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Chatbot Modal */}
      <ChatbotModal isOpen={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
};

export default HomePage;