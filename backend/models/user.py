from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    name:     str
    email:    EmailStr
    password: str


class UserLogin(BaseModel):
    email:    str   # accepts email OR username/name
    password: str

