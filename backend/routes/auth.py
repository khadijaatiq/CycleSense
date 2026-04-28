from fastapi import APIRouter, HTTPException
from pydantic import ValidationError
from models.user import UserRegister, UserLogin
from database import users_collection
from auth import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register")
def register(user: UserRegister):
    # Check duplicate email
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check duplicate username
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed   = hash_password(user.password)
    new_user = {
        "username":        user.username,
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
    # Try email lookup first, then fall back to username
    user = users_collection.find_one({"email": credentials.email})
    if not user:
        user = users_collection.find_one({"username": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email/username or password")

    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email/username or password")

    token = create_access_token({
        "sub":      str(user["_id"]),
        "email":    user["email"],
        "username": user["username"]
    })

    return {
        "access_token": token,
        "token_type":   "bearer",
        "name":         user["username"]   # frontend reads .name, map username here
    }
