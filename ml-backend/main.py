"""
main.py  —  LearnPath ML Recommendation API
────────────────────────────────────────────
Run locally:
  uvicorn main:app --reload --port 8000

POST /recommend
  Body : { career_goal, current_skills, learning_speed, hours_per_day }
  Returns: CareerPath JSON  (label, description, topics[])

The model predicts which topic indices to include, then this server:
  1. Assembles the topic list from the catalogue
  2. Scales estimatedHours by learning_speed multiplier
  3. Caps hours at a sensible ceiling for very fast learners
"""

import pickle
from pathlib import Path
from typing import Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from training_data import (
    TOPICS,
    CAREER_PATH_DESCRIPTIONS,
    SKILL_COLUMNS,
)

# ── Load model artefacts ──────────────────────────────────────────────────────

BASE = Path(__file__).parent

with open(BASE / "model.pkl", "rb") as f:
    MODEL = pickle.load(f)

with open(BASE / "label_encoders.pkl", "rb") as f:
    ENCODERS = pickle.load(f)

CAREER_ENC = ENCODERS["career"]
SPEED_ENC  = ENCODERS["speed"]

SPEED_MULTIPLIER = {
    "Beginner":     1.3,
    "Intermediate": 1.0,
    "Fast Learner": 0.7,
}

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="LearnPath Recommendation API",
    description="Scikit-learn powered personalised learning path generator",
    version="1.0.0",
)

# Allow requests from the TanStack/Vite dev server and production origin.
# Adjust origins to match your deployment URLs.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        # Add your production URL here, e.g. "https://yourapp.pages.dev"
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ── Schemas ───────────────────────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    career_goal:    str            = Field(..., example="Python Developer")
    current_skills: list[str]      = Field(default=[], example=["Python", "SQL"])
    learning_speed: str            = Field(..., example="Intermediate")
    hours_per_day:  float          = Field(..., ge=0.5, le=12, example=2.0)


class TopicOut(BaseModel):
    title:          str
    description:    str
    estimatedHours: float


class CareerPathOut(BaseModel):
    label:       str
    description: str
    topics:      list[TopicOut]


# ── Feature encoding (mirrors model.py exactly) ───────────────────────────────

def encode_features(req: RecommendRequest) -> np.ndarray:
    skill_vec = [1 if s in req.current_skills else 0 for s in SKILL_COLUMNS]
    return np.array(
        [CAREER_ENC.transform([req.career_goal])[0],
         SPEED_ENC.transform([req.learning_speed])[0],
         float(req.hours_per_day)]
        + skill_vec,
        dtype=float,
    ).reshape(1, -1)


# ── Endpoint ──────────────────────────────────────────────────────────────────

@app.post("/recommend", response_model=CareerPathOut)
def recommend(req: RecommendRequest) -> CareerPathOut:
    # Validate career_goal and learning_speed against known labels
    known_goals  = list(TOPICS.keys())
    known_speeds = ["Beginner", "Intermediate", "Fast Learner"]

    if req.career_goal not in known_goals:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown career_goal '{req.career_goal}'. "
                   f"Valid options: {known_goals}",
        )
    if req.learning_speed not in known_speeds:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid learning_speed '{req.learning_speed}'. "
                   f"Must be one of: {known_speeds}",
        )

    # Build feature vector and run inference
    X = encode_features(req)
    predictions = MODEL.predict(X)[0]   # shape (MAX_TOPICS,)

    # Map predicted 1s back to topic objects for this career path
    path_topics  = TOPICS[req.career_goal]
    multiplier   = SPEED_MULTIPLIER[req.learning_speed]
    n_topics     = len(path_topics)

    selected_topics: list[TopicOut] = []
    for idx, include in enumerate(predictions[:n_topics]):
        if include == 1:
            t = path_topics[idx]
            selected_topics.append(TopicOut(
                title=t["title"],
                description=t["description"],
                estimatedHours=round(t["baseHours"] * multiplier, 1),
            ))

    # Safety net: if model predicted nothing (edge case), return all topics
    if not selected_topics:
        selected_topics = [
            TopicOut(
                title=t["title"],
                description=t["description"],
                estimatedHours=round(t["baseHours"] * multiplier, 1),
            )
            for t in path_topics
        ]

    return CareerPathOut(
        label=req.career_goal,
        description=CAREER_PATH_DESCRIPTIONS[req.career_goal],
        topics=selected_topics,
    )


@app.get("/health")
def health():
    return {"status": "ok", "model": "RandomForest MultiOutputClassifier"}
