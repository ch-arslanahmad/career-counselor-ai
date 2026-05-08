from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)



# CORS is a browser security rule. Without this, your frontend (port
# 8000) can't call your backend (port 8001). This import brings in the
# tool that disables that rule for development.


@app.get("/")
def root():
    return {"message": "Hello World"}

@app.get("/ping")
def ping():
    return {"message": "pong"}
