# Backend

For setup for backend,

```bash
# creating a python virtual environment

cd backend && python3 -m venv venv

source venv/bin/activate
# On Windows: venv\Scripts\activate

# installing dependencies
pip install fastapi uvicorn


```

To run the backend server:

```bash

cd backend && source venv/bin/activate
uvicorn main:app --reload --port 8001

```
