from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from routes import auth, cycles, predict

app = FastAPI(
    title="CycleSense API",
    version="1.0.0",
    description="API for tracking menstrual cycles"
)

# ✅ KEEP your CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ KEEP your routers
app.include_router(auth.router,    prefix="/auth",   tags=["Authentication"])
app.include_router(cycles.router,  prefix="/cycle",  tags=["Cycles"])
app.include_router(predict.router, prefix="/cycle",  tags=["Prediction"])


# ✅ ADD THIS (Swagger Bearer fix)
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="CycleSense API",
        version="1.0.0",
        description="API for tracking menstrual cycles",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    # Apply to all routes except auth
    for path in openapi_schema["paths"]:
        if path.startswith("/auth"):
            continue
        for method in openapi_schema["paths"][path]:
            openapi_schema["paths"][path][method]["security"] = [{"Bearer": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


@app.get("/")
def root():
    return {"message": "CycleSense API is running"}