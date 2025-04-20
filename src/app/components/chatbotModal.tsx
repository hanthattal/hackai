"use client";

import React, { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ChatbotModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  useEffect(() => {
    const fetchEmbedding = async () => {
      try {
        const res = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: "2023 was a strong year with increased revenue and net margin growth...",
            model: "text-embedding-ada-002",
          }),
        });

        const data = await res.json();
        const embedding = data?.data?.[0]?.embedding;
        if (embedding) {
          sessionStorage.setItem("reportEmbedding", JSON.stringify(embedding));
          console.log("✅ Stored OpenAI embedding in sessionStorage.");
        }
      } catch (err) {
        console.error("❌ Failed to fetch OpenAI embedding", err);
      }
    };

    fetchEmbedding();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-base-100 w-11/12 h-5/6 rounded-xl shadow-xl p-6 relative">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Chatbot Assistant</h2>
        <div className="w-full h-full overflow-auto">
          <p className="text-gray-500">This space will host your chatbot interface.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;