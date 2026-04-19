from fastapi import APIRouter, HTTPException, Header
from models.cycle import CycleLog
from database import cycles_collection
from auth import decode_token

router = APIRouter()


def get_user_id(authorization: str = Header(alias="Authorization")) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token   = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token expired or invalid")
    return payload["sub"]

@router.post("/log")
def log_cycle(cycle: CycleLog, authorization: str = Header(alias="Authorization")):
    user_id       = get_user_id(authorization)
    cycle_count   = cycles_collection.count_documents({"user_id": user_id})

    entry = {
        "user_id":            user_id,
        "cycle_number":       cycle_count + 1,
        "cycle_start_date":   cycle.cycle_start_date,
        "cycle_length":       cycle.cycle_length,
        "stress_level":       cycle.stress_level,
        "sleep_hours":        cycle.sleep_hours,
        "exercise_intensity": cycle.exercise_intensity,
        "illness_flag":       cycle.illness_flag
    }

    cycles_collection.insert_one(entry)

    return {
        "message":      "Cycle logged successfully",
        "cycle_number": cycle_count + 1
    }


@router.get("/history")
def get_history(authorization: str = Header(alias="Authorization")):
    user_id = get_user_id(authorization)
    cycles  = list(
        cycles_collection
        .find({"user_id": user_id}, {"_id": 0})
        .sort("cycle_number", 1)
    )
    return {"cycles": cycles, "total": len(cycles)}

