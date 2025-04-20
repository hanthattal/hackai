"use client";

import React, { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ChatbotModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");

  if (!isOpen) return null;

  const handleAsk = async () => {
    console.log("🟡 handleAsk triggered with question:", question); // ← ADD THIS
  
    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: question }),
      });
  
      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      console.error("❌ Error calling backend:", err);
    }
  };
  
  

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-[#e6f4ea] to-[#cde4d3] bg-opacity-95">
      <div className="bg-white text-black w-[90%] max-w-3xl h-[80%] rounded-xl shadow-lg p-6 relative border border-[#b6d7b9]">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-center text-green-900 drop-shadow-md">Your Investment Assistant</h2>
        <div className="mb-4">
          <input
            type="text"
            className="w-full px-4 py-2 border border-[#b6d7b9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Ask a question..."
            value={question}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuestion(e.target.value)
            }
          />
          <button
            className="mt-3 w-full py-2 rounded-md bg-gradient-to-r from-[#76b852] to-[#8DC26F] text-white font-medium hover:from-[#669944] hover:to-[#79b26c] transition-all"
            onClick={handleAsk}
          >
            Ask
          </button>

        </div>
        {answer && (
            <div className="mt-6 p-4 bg-[#e6f4ea] rounded-lg shadow-inner border border-[#b6d7b9]">
              <strong className="block text-gray-700 mb-2">Answer:</strong>
              <p className="text-green-800">{answer}</p>
            </div>
        )}
      </div>
    </div>
  );
};
  
export default ChatbotModal;
