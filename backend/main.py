from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import db_health
from routes.db_options import router as options_router
from routes.recommendations import router as recommendations_router
from routes.tasks import router as tasks_router
from routes.auth import router as auth_router
from routes.history import router as history_router

app = FastAPI(title="Career Counselor AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8001",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://0.0.0.0:8000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(options_router)
app.include_router(recommendations_router)
app.include_router(tasks_router)
app.include_router(auth_router)
app.include_router(history_router)


@app.get("/")
def root():
    return {"message": "Career Counselor AI backend is running"}


@app.get("/ping")
def ping():
    return {"message": "pong"}


@app.get("/db/health")
def health():
    healthy, message = db_health()
    return {"healthy": healthy, "message": message}
