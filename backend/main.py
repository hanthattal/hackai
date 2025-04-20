from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
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
    print("🧠 Incoming prediction request:")
    sentiment_map = { "positive": 1, "neutral": 0, "negative": -1 }
    
    for s in request.sentiment_scores:
        print(f"🗣️ {s.sentiment} @ {s.confidence_score}")
        
    print("🧠 Raw sentiment_scores received:", jsonable_encoder(request.sentiment_scores))
    
    score = np.mean([
        sentiment_map[s.sentiment] * s.confidence_score
        for s in request.sentiment_scores
    ])
    
    if not request.pricing_data or not all(isinstance(row, list) and row for row in request.pricing_data):
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid or empty pricing data"}
        )
    
    print(f"📊 Loaded model for strategy: {request.strategy}")
    pricing_rows = len(request.pricing_data)
    pricing_cols = len(request.pricing_data[0]) if request.pricing_data and request.pricing_data[0] else 0
    print(f"📈 Pricing data shape: {pricing_rows} × {pricing_cols}")
    print(f"🧠 Final sentiment score: {score}")
    
    try:
        result = predict(
            request.strategy,
            score,
            request.pricing_data,
            request.report_embedding
        )
        encoded_result = jsonable_encoder(result, custom_encoder={float: lambda x: float(x) if np.isfinite(x) else 0.0})
        return JSONResponse(content=encoded_result)
    except ValueError as e:
        print("❌ JSON encoding error:", e)
        return JSONResponse(
            status_code=500,
            content={"error": "Prediction result contains non-JSON-compliant values"}
        )

from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print("❌ Validation error:")
    for error in exc.errors():
        print(error)
    return JSONResponse(status_code=422, content={"detail": exc.errors()})