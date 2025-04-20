"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatbotModal from '@/app/components/chatbotModal';
import { MessageSquare } from "lucide-react";
import { InsiderTradingSection, InsiderSummary } from '@/app/components/insidertrading';
import GlobalNewsWithSentiment from '@/app/components/globalNews';

const HomePage = () => {



    const searchParams = useSearchParams();
    const reportLink = searchParams.get('url');
    const company = searchParams.get('company');
    const ticker = searchParams.get('ticker');
    const cik = searchParams.get('cik');
    const source = searchParams.get('source'); // "india" if from Screener.in
    const style = searchParams.get("style") || "long";

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