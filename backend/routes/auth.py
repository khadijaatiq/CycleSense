from fastapi import APIRouter, HTTPException
from models.user import UserRegister, UserLogin
from database import users_collection
from auth import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register")
def register(user: UserRegister):
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed   = hash_password(user.password)
    new_user = {
        "name":            user.name,
        "email":           user.email,
        "hashed_password": hashed
    }
    result = users_collection.insert_one(new_user)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }


@router.post("/login")
def login(credentials: UserLogin):
    # Try email first, then fall back to name match
    user = users_collection.find_one({"email": credentials.email})
    if not user:
        user = users_collection.find_one({"name": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email/username or password")

    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email/username or password")

    token = create_access_token({
        "sub":   str(user["_id"]),
        "email": user["email"]
    })

    return {
        "access_token": token,
        "token_type":   "bearer",
        "name":         user["name"]
    }

