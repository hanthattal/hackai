"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Using lucide icons

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
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/news?company=${encodeURIComponent(company)}`);
        const data = await res.json();
        setArticles(Array.isArray(data.results) ? data.results : []);
        //console.log('data',data);
      } catch (err) {
        //console.error("Failed to fetch news", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [company]);

  useEffect(() => {
    const runSentimentAnalysis = async () => {
      const finalScores: { sentiment: string, confidence_score: number }[] = [];

      for (let i = 0; i < articles.length; i++) {
        const fullText = `${articles[i].title} ${articles[i].description}`;
        //console.log(`▶️ Running analysis for article #${i}:`);

        let vader: VaderSentiment | null = null;
        let groq: GroqAnalysis | null = null;

        // Fetch VADER sentiment
        try {
          const vaderRes = await fetch("https://vader-fastapi.onrender.com/sentiment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: fullText }),
          });
          vader = await vaderRes.json();
          //console.log(`🧪 VADER #${i}:`, vader);
          if (vader !== null && typeof vader.compound === "number") {
            setVaderScores((prev) => ({ ...prev, [i]: vader as VaderSentiment }));
          }
        } catch (err) {
          //console.error(`❌ VADER failed for article #${i}:`, err);
        }

        // Fetch Groq sentiment
        try {
          const groqRes = await fetch("/api/groq-news", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: fullText }),
          });
          const rawGroq = await groqRes.json();
          if (rawGroq.sentiment_analysis) {
            groq = rawGroq.sentiment_analysis;
            //console.log(`✅ Parsed Groq response #${i}:`, groq);
            if (groq !== null) {
              setGroqScores((prev) => ({ ...prev, [i]: groq as GroqAnalysis }));
            }
          } else {
            //console.warn(`⚠️ Groq response missing sentiment_analysis for article #${i}`, rawGroq);
            groq = { sentiment: "neutral", confidence_score: 0 };
            setGroqScores((prev) => ({ ...prev, [i]: groq! }));
          }
        } catch (err) {
          //console.error(`❌ Groq failed for article #${i}:`, err);
        }

        if (vader && groq && vader.compound !== 0) {
          const finalSentimentScore = Math.abs(vader.compound);
          const sentiment = groq.sentiment === "positive" ? "positive" :
                            groq.sentiment === "negative" ? "negative" : "neutral";

          finalScores.push({
            sentiment,
            confidence_score: finalSentimentScore
          });
        }
      }
      
      if (finalScores.length > 0) {
        sessionStorage.setItem("sentimentScores", JSON.stringify(finalScores));
      }
    };

    if (articles.length > 0) runSentimentAnalysis();
  }, [articles]);

  // Get sorted articles based on sentiment confidence
  const sortedArticles = articles.length > 0 
    ? articles
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
    : [];

  // Carousel navigation functions
  const nextSlide = () => {
    if (sortedArticles.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % sortedArticles.length);
    }
  };

  const prevSlide = () => {
    if (sortedArticles.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + sortedArticles.length) % sortedArticles.length);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="p-4 rounded-2xl shadow bg-slate-100 ">
      {loading ? (
        <p>Loading news...</p>
      ) : articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        <div className="relative">
          {/* Carousel container */}
          <div className="carousel w-full px-6">
            {sortedArticles.map(({ index, article }, i) => (
              <div 
                key={index} 
                id={`slide-${i}`}
                className={`carousel-item  relative w-full ${i === currentSlide ? 'block' : 'hidden'}`}
              >
                <div className="w-full border-b pb-5">
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
                  <div className="text-sm mt-2 max-h-[6.5rem] overflow-y-auto pr-1">
                    {article.description}
                  </div>

                  <div className="mt-3 text-sm border-t pt-2">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">🧪 VADER:</span>
                      <span>{vaderScores[index] ? (
                        <>
                          {vaderScores[index].sentiment} (
                          <span className={`${vaderScores[index].compound > 0 ? 'text-green-600' : vaderScores[index].compound < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {vaderScores[index].compound.toFixed(2)}
                          </span>)
                        </>
                      ) : "Analyzing..."}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">🤖 Groq:</span>
                      <span>{groqScores[index] ? (
                        <>
                          {groqScores[index].sentiment} (
                          <span className={`${groqScores[index].sentiment === 'positive' ? 'text-green-600' : groqScores[index].sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                            {groqScores[index]?.confidence_score !== undefined
                              ? groqScores[index].confidence_score.toFixed(2)
                              : "N/A"}
                          </span>)
                        </>
                      ) : "Analyzing..."}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between absolute top-1/2 transform -translate-y-1/2 -left-2 -right-2">
            <button 
              onClick={prevSlide}
              className="btn btn-circle btn-sm bg-gray-100 hover:bg-gray-200 border-gray-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button 
              onClick={nextSlide}
              className="btn btn-circle btn-sm bg-gray-100 hover:bg-gray-200 border-gray-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Carousel indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {sortedArticles.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-2 h-2 rounded-full ${i === currentSlide ? 'bg-green-600' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${i+1}`}
              />
            ))}
          </div>

          {/* Counter display */}
          <div className="text-center mt-2 text-sm text-gray-500">
            {sortedArticles.length > 0 ? (
              <span>{currentSlide + 1} of {sortedArticles.length}</span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}