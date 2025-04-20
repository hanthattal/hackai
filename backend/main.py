from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List, Literal
import numpy as np
from predictor import load_models, predict

app = FastAPI()
load_models()

class Sentiment(BaseModel):
    sentiment: Literal["positive", "neutral", "negative"]
    confidence_score: float

class PredictionRequest(BaseModel):
    ticker: str
    strategy: Literal["long", "short", "trading"]
    sentiment_scores: List[Sentiment]
    pricing_data: List[List[float]]
    report_embedding: List[float]

@app.post("/predict")
def get_prediction(request: PredictionRequest):
    sentiment_map = { "positive": 1, "neutral": 0, "negative": -1 }
    
    for s in request.sentiment_scores:
        print(f"🗣️ {s.sentiment} @ {s.confidence_score}")
        
    print("🧠 Raw sentiment_scores received:", jsonable_encoder(request.sentiment_scores))
    
    score = np.mean([
        sentiment_map[s.sentiment] * s.confidence_score
        for s in request.sentiment_scores
    ])
    print(f"📊 Loaded model for strategy: {request.strategy}")
    print(f"📈 Pricing data shape: {len(request.pricing_data)} × {len(request.pricing_data[0])}")
    print(f"🧠 Final sentiment score: {score}")
    print(f"📄 Report embedding length: {len(request.report_embedding)}")
    
    return predict(request.strategy, request.pricing_data, score, request.report_embedding)