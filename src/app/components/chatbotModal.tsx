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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-base-100 w-11/12 h-5/6 rounded-xl shadow-xl p-6 relative">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Chatbot Assistant</h2>
        <div className="mb-4">
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Ask a question..."
            value={question}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuestion(e.target.value)
            }
          />
          <button className="btn btn-primary mt-2" onClick={handleAsk}>
            Ask
          </button>

        </div>
        {answer && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-black">
            <strong>Answer:</strong> {answer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotModal;
