"""
model.py
────────
Trains a multi-output scikit-learn classifier that predicts which topic
indices to include in a personalised CareerPath, then saves the pipeline to
model.pkl.

Features (all numeric after encoding):
  - career_goal_enc      : LabelEncoded integer (0-3)
  - learning_speed_enc   : LabelEncoded integer (0-2)
  - hours_per_day        : float
  - skill_<name>         : binary 0/1 per known skill (20 columns)

Target:
  - topic_i              : binary 0/1 per topic index (max 9 columns)
    We use a MultiOutputClassifier wrapping RandomForestClassifier.
    Each output is an independent binary classifier: "include this topic?"

Usage:
  python model.py          → trains and saves model.pkl + label_encoders.pkl
"""

import pickle
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.preprocessing import LabelEncoder

from training_data import TRAINING_DATA, TOPICS, SKILL_TOPIC_OVERLAP, SKILL_COLUMNS

# ── Config ────────────────────────────────────────────────────────────────────

MAX_TOPICS = 9          # Python Developer has the most topics (9)

# ── Encoders ─────────────────────────────────────────────────────────────────

career_enc = LabelEncoder()
career_enc.fit(list(TOPICS.keys()))

speed_enc = LabelEncoder()
speed_enc.fit(["Beginner", "Intermediate", "Fast Learner"])

# ── Feature engineering ───────────────────────────────────────────────────────

def encode_features(
    career_goal: str,
    current_skills: list[str],
    learning_speed: str,
    hours_per_day: float,
) -> np.ndarray:
    """Convert raw inputs into a fixed-length numeric feature vector."""
    skill_vec = [1 if s in current_skills else 0 for s in SKILL_COLUMNS]
    return np.array(
        [career_enc.transform([career_goal])[0],
         speed_enc.transform([learning_speed])[0],
         float(hours_per_day)]
        + skill_vec,
        dtype=float,
    )


def encode_targets(career_goal: str, topic_indices: list[int]) -> np.ndarray:
    """Binary vector of length MAX_TOPICS — 1 if that index should appear."""
    vec = np.zeros(MAX_TOPICS, dtype=int)
    n_topics = len(TOPICS[career_goal])
    for idx in topic_indices:
        if idx < n_topics:
            vec[idx] = 1
    return vec


# ── Build X, Y matrices ───────────────────────────────────────────────────────

X_rows, Y_rows = [], []
for rec in TRAINING_DATA:
    X_rows.append(encode_features(
        rec["career_goal"],
        rec["current_skills"],
        rec["learning_speed"],
        rec["hours_per_day"],
    ))
    Y_rows.append(encode_targets(rec["career_goal"], rec["topic_indices"]))

X = np.vstack(X_rows)
Y = np.vstack(Y_rows)

# ── Train ─────────────────────────────────────────────────────────────────────

base_clf = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    min_samples_leaf=1,
    random_state=42,
)
model = MultiOutputClassifier(base_clf, n_jobs=-1)
model.fit(X, Y)
print(f"Trained on {len(X)} samples  |  {X.shape[1]} features  |  {Y.shape[1]} outputs")

# ── Persist ───────────────────────────────────────────────────────────────────

out_dir = Path(__file__).parent
with open(out_dir / "model.pkl", "wb") as f:
    pickle.dump(model, f)

with open(out_dir / "label_encoders.pkl", "wb") as f:
    pickle.dump({"career": career_enc, "speed": speed_enc}, f)

print("Saved → model.pkl, label_encoders.pkl")
