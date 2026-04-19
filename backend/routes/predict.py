from fastapi import APIRouter, HTTPException, Header
from database import cycles_collection
from routes.cycles import get_user_id
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ml'))
from predict import predict_next_cycle

router = APIRouter()


@router.get("/predict")
def get_prediction(authorization: str = Header(None)):
    user_id = get_user_id(authorization)

    cycles = list(
        cycles_collection
        .find({"user_id": user_id}, {"_id": 0})
        .sort("cycle_number", 1)
    )

    if len(cycles) == 0:
        raise HTTPException(
            status_code=400,
            detail="No cycles logged yet. Log at least one cycle first."
        )

    history = [
        {
            "cycle_length":       c["cycle_length"],
            "stress_level":       c["stress_level"],
            "sleep_hours":        c["sleep_hours"],
            "exercise_intensity": c["exercise_intensity"],
            "illness_flag":       c["illness_flag"]
        }
        for c in cycles
    ]

    result = predict_next_cycle(history)

    return {
        "predicted_days":   result["predicted_days"],
        "confidence_range": result["confidence_range"],
        "reliable":         result["reliable"],
        "method":           result["method"],
        "cycles_logged":    len(cycles)
    }

