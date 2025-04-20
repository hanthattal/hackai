"use client";
import { useEffect, useState } from "react";

type Article = {
  title: string;
  link: string;
  pubDate: string;
  source_id: string;
  description: string;
};

type VaderSentiment = {
  sentiment: string;
  compound: number;
  positive: number;
  neutral: number;
  negative: number;
};

type GroqAnalysis = {
  sentiment: string;
  confidence_score: number;
};

export default function GlobalNewsWithSentiment({ company }: { company: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [vaderScores, setVaderScores] = useState<Record<number, VaderSentiment>>({});
  const [groqScores, setGroqScores] = useState<Record<number, GroqAnalysis>>({});

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/news?company=${encodeURIComponent(company)}`);
        const data = await res.json();
        setArticles(data.results || []);
      } catch (err) {
        console.error("Failed to fetch news", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [company]);

  useEffect(() => {
    const runSentimentAnalysis = async () => {
      for (let i = 0; i < articles.length; i++) {
        const fullText = `${articles[i].title} ${articles[i].description}`;
        console.log(`▶️ Running analysis for article #${i}:`, fullText);

        // VADER request
        try {
          const vaderRes = await fetch("https://vader-fastapi.onrender.com/sentiment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: fullText }),
          });
          const vader = await vaderRes.json();
          console.log(`🧪 VADER #${i}:`, vader);
          setVaderScores((prev) => ({ ...prev, [i]: vader }));
        } catch (err) {
          console.error(`❌ VADER failed for article #${i}:`, err);
        }

        // Groq request
        try {
          const groqRes = await fetch("/api/groq-news", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: fullText }),
          });
          const rawGroq = await groqRes.json();
          if (rawGroq.sentiment_analysis) {
            console.log(`✅ Parsed Groq response #${i}:`, rawGroq.sentiment_analysis);
            setGroqScores((prev) => ({ ...prev, [i]: rawGroq.sentiment_analysis }));
          } else {
            console.warn(`⚠️ Groq response missing sentiment_analysis for article #${i}`, rawGroq);
            setGroqScores((prev) => ({
              ...prev,
              [i]: { sentiment: "unknown", confidence_score: 0 },
            }));
          }
        } catch (err) {
          console.error(`❌ Groq failed for article #${i}:`, err);
        }
      }
    };

    if (articles.length > 0) runSentimentAnalysis();
  }, [articles]);

  return (
    <div className="p-4 rounded-2xl shadow bg-white">
      <h2 className="text-xl font-semibold mb-4">🌍 Global News with Sentiment</h2>
      {loading ? (
        <p>Loading news...</p>
      ) : articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        <ul className="space-y-4">
          {articles
            .map((article, index) => {
              const vader = vaderScores[index];
              const groq = groqScores[index];
              const vaderConfidence = vader ? Math.abs(vader.compound) : 0;
              const groqConfidence = groq ? groq.confidence_score : 0;
              const avgConfidence = (vaderConfidence + groqConfidence) / 2;
              return { index, article, avgConfidence };
            })
            .sort((a, b) => b.avgConfidence - a.avgConfidence)
            .slice(0, 5)
            .map(({ index, article }) => (
              <li key={index} className="border-b pb-3">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium hover:underline"
                >
                  {article.title}
                </a>
                <div className="text-sm text-gray-600">
                  {article.source_id} · {new Date(article.pubDate).toLocaleDateString()}
                </div>
                <p className="text-sm mt-1">{article.description}</p>

                <div className="mt-2 text-sm">
                  <div>
                    <strong>🧪 VADER:</strong>{" "}
                    {vaderScores[index] ? (
                      <>
                        {vaderScores[index].sentiment} (score:{" "}
                        {vaderScores[index].compound.toFixed(2)})
                      </>
                    ) : (
                      "Analyzing..."
                    )}
                  </div>
                  <div>
                    <strong>🤖 Groq:</strong>{" "}
                    {groqScores[index] ? (
                      <>
                        {groqScores[index].sentiment} (confidence:{" "}
                          {groqScores[index]?.confidence_score !== undefined
                            ? groqScores[index].confidence_score.toFixed(2)
                            : "N/A"}
                      </>
                    ) : (
                      "Analyzing..."
                    )}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}