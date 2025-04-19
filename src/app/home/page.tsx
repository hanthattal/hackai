"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatbotModal from '@/app/components/chatbotModal';
import { MessageSquare } from "lucide-react";


const HomePage = () => {
  const searchParams = useSearchParams();
  const reportLink = searchParams.get('url');
  const company = searchParams.get('company');
  const ticker = searchParams.get('ticker');
  const cik = searchParams.get('cik');




  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="flex h-screen relative">
      {/* Left half: PDF viewer */}
      <div className="w-1/2 bg-base-100 border-r border-base-300 p-4 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">{ticker} Annual Report</h1>
        {reportLink ? (
          <iframe
            src={`/api/report?url=${encodeURIComponent(reportLink ?? "")}`}
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
        <p className="text-xl font-semibold">Other analysis content goes here.</p>
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