from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


# CORS is a browser security rule. not allowing frontend to access backend if they are on different ports.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)





@app.get("/")
def root():
    return {"message": "Hello World"}

@app.get("/ping")
def ping():
    return {"message": "pong"}

# -- OPTIONS for the MAIN FORM --

skills = ["Python", "JavaScript", "Data Analysis", "Project Management"]
interests = ["Technology", "Healthcare", "Finance", "Education", "Arts", "Science"]
industries = ["Software", "Healthcare", "Finance", "Education"]
locations = ["USA", "Canada", "UK", "Germany", "Australia", "Pakistan", "India", "China"]



@app.get("/options/skills")
def get_skills():
    return {"skills": skills}

@app.get("/options/interests")
def get_interests():
    return {"interests": interests}

@app.get("/options/industries")
def get_industries():
    return {"industries": industries}

@app.get("/options/locations")
def get_locations():
    return {"locations": locations}

