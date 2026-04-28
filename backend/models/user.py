import re
from pydantic import BaseModel, EmailStr, validator


class UserRegister(BaseModel):
    username: str
    email:    EmailStr
    password: str

    @validator('username')
    def username_valid(cls, v):
        if ' ' in v:
            raise ValueError('Username must not contain spaces')
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username may only contain letters, numbers, and underscores')
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        if len(v) > 20:
            raise ValueError('Username must be 20 characters or fewer')
        return v

    @validator('password')
    def password_valid(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must include at least one uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must include at least one number')
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"|,.<>/?]', v):
            raise ValueError('Password must include at least one special character')
        return v


class UserLogin(BaseModel):
    email:    str   # accepts email OR username
    password: str

