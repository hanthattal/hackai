"use client";

import React, { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ChatbotModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const [messages, setMessages] = useState<
    { role: "system" | "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const fetchEmbedding = async () => {
    const reportHtml = sessionStorage.getItem("reportHtml") || "";
    const embeddingInput = reportHtml || "2023 was a strong year with increased revenue and net margin growth...";
    try {
        const res = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: embeddingInput,
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

  useEffect(() => {
    const strat = sessionStorage.getItem("investmentStyle");
    if (strat) {
      setMessages(prev => {
        const alreadyIncluded = prev.some(msg => msg.role === "system" && msg.content.includes("investment strategy"));
        return alreadyIncluded
          ? prev
          : [...prev, { role: "system", content: `Your investment strategy is: ${strat}! How can I help you?` }];
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white text-black w-full max-w-3xl h-5/6 rounded-2xl shadow-2xl p-6 relative border border-green-300">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Chatbot Assistant</h2>
        <div className="flex flex-col h-full">
          <div className="chat flex-1 overflow-auto mb-4 flex flex-col space-y-2" id="chatlog">
          {messages.map((msg, idx) => (
  <div
    key={idx}
    className={`chat ${
      msg.role === "user"
        ? "chat-end"
        : msg.role === "assistant"
        ? "chat-start"
        : "chat-center"
    }`}
  >
    <div
      className={`chat-bubble ${
        msg.role === "system"
          ? "bg-green-100 text-green-900"
          : msg.role === "assistant"
          ? "bg-green-200 text-green-900"
          : "bg-white text-black border border-green-300"
      }`}
    >
      {msg.content}
    </div>
  </div>
))}
          </div>
          <form
            className="flex items-center"
            onSubmit={async (e) => {
              e.preventDefault();
              const inputEl = document.getElementById("chatInput") as HTMLInputElement;
              const msg = inputEl.value;
              if (!msg) return;

              // Immediately update messages including the new user message
              const newMessagesTyped: { role: "system" | "user" | "assistant"; content: string }[] = [
                ...messages,
                { role: "user", content: msg }
              ];
              setMessages(newMessagesTyped);
              inputEl.value = "";
              setLoading(true);

              const predictionData = {
                ticker: sessionStorage.getItem("ticker"),
                strategy: sessionStorage.getItem("investmentStyle"),
                sentiment_scores: sessionStorage.getItem("sentimentScores")
                  ? JSON.parse(sessionStorage.getItem("sentimentScores")!)
                  : [],
                report_embedding: sessionStorage.getItem("reportEmbedding")
                  ? JSON.parse(sessionStorage.getItem("reportEmbedding")!)
                  : [],
              };

              console.log("📤 Sending predictionData:", predictionData);
              try {
                const predictRes = await fetch("/api/predict", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(predictionData),
                });
                console.log("📥 predictRes status:", predictRes.status);
                const predictData = await predictRes.json();
                console.log("📦 Received predictData:", predictData);
                if (!predictRes.ok) {
                  throw new Error(`Prediction API error (${predictRes.status}): ${predictData.detail || predictData.error}`);
                }

                const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
  {
    role: "system",
    content:
      "You are a financial assistant. Use the provided prediction results, sentiment scores, and annual report embedding to justify all estimates, numerical outputs, or suggestions. Explain how numbers were derived using data like historical pricing, sentiment analysis, and financial content from the annual report. Provide sources or input factors used in your reasoning."
  },
                  {
                    role: "system",
                    content: `Prediction details: ${JSON.stringify(predictData)}`
                  },
                ...newMessagesTyped,
                ];
                console.log("💬 Sending chatMessages:", chatMessages);

                const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    model: "gpt-4",
                    messages: chatMessages,
                    temperature: 0.7,
                  }),
                });
                console.log("📥 chatRes status:", chatRes.status);
                const chatJson = await chatRes.json();
                console.log("📦 chatJson:", chatJson);
                if (!chatRes.ok) {
                  throw new Error(`Chat completion API error (${chatRes.status}): ${chatJson.error?.message || chatJson}`);
                }
                const botContent = chatJson.choices[0].message.content;
                setMessages((prev) => [...prev, { role: "assistant", content: botContent }]);
              } catch (err: any) {
                const errorMsg = err.message || String(err);
                setMessages(prev => [
                  ...prev,
                  { role: "assistant", content: `❌ Failed to get prediction insights: ${errorMsg}` }
                ]);
                console.error("Error during chat interaction:", err);
              } finally {
                setLoading(false);
              }
            }}
          >
            <input
              id="chatInput"
              type="text"
              placeholder="Ask a question..."
              className="input input-bordered flex-1 mr-2 bg-white text-black border-green-300 placeholder-green-500"
            />
            <button className="btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;