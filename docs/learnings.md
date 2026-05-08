# Learnings

## CORS

CORS stands for Cross-Origin Resource Sharing. It is a security feature implemented by web browsers to restrict web pages from making requests to a different domain than the one that served the web page. This is done to prevent malicious websites from accessing sensitive data on other domains.

For example in my case,

Frontend: http://localhost:8000
Backend: http://localhost:8001

Due to different ports, the browser considers them as different origins. When the frontend tries to make an API call to the backend, the browser will block the request unless the backend explicitly allows it by including the appropriate CORS headers in its response.

In python in `FASTAPI`, we use,

```python

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allow backend port (here all allowed)
    allow_methods=["*"], # HTTP Methods allowed
    allow_headers=["*"], # all HTTP headers allowed
)

```
